const { v4: uuidv4 } = require('uuid');

class EquipmentModel {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all equipment for a user
   * @param {string} userId - The user ID
   * @param {Object} queryParams - Query parameters for filtering and pagination
   * @returns {Promise<Array>} - List of equipment
   */
  async getAllEquipment(userId, queryParams = {}) {
    const {
      categoryId,
      searchTerm,
      sortBy = 'name',
      sortOrder = 'ASC',
      page = 1,
      limit = 10
    } = queryParams;

    const offset = (page - 1) * limit;
    
    // Build the base query
    let query = `
      SELECT e.*, c.name as category_name, 
      (SELECT image_url FROM equipment_images WHERE equipment_id = e.id AND is_primary = true LIMIT 1) as primary_image_url
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1
    `;
    
    const queryParams = [userId];
    let paramIndex = 2;

    // Add category filter
    if (categoryId) {
      query += ` AND e.category_id = $${paramIndex}`;
      queryParams.push(categoryId);
      paramIndex++;
    }

    // Add search term
    if (searchTerm) {
      query += ` AND (
        e.name ILIKE $${paramIndex} 
        OR e.brand ILIKE $${paramIndex} 
        OR e.model ILIKE $${paramIndex}
        OR e.serial_number ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Add sorting
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    try {
      // Get the equipment items
      const { rows: equipment } = await this.db.query(query, queryParams);
      
      // Get the total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM equipment e
        WHERE e.user_id = $1
        ${categoryId ? 'AND e.category_id = $2' : ''}
        ${searchTerm ? `AND (
          e.name ILIKE $${categoryId ? 3 : 2} 
          OR e.brand ILIKE $${categoryId ? 3 : 2} 
          OR e.model ILIKE $${categoryId ? 3 : 2}
          OR e.serial_number ILIKE $${categoryId ? 3 : 2}
        )` : ''}
      `;
      
      const countParams = [userId];
      if (categoryId) countParams.push(categoryId);
      if (searchTerm) countParams.push(`%${searchTerm}%`);
      
      const { rows: countResult } = await this.db.query(countQuery, countParams);
      const total = parseInt(countResult[0].total, 10);
      
      return {
        data: equipment,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (err) {
      throw new Error(`Error fetching equipment: ${err.message}`);
    }
  }

  /**
   * Get a single equipment item by ID
   * @param {string} id - Equipment ID
   * @param {string} userId - User ID for authorization
   * @returns {Promise<Object>} - Equipment details
   */
  async getEquipmentById(id, userId) {
    try {
      // Get the basic equipment info
      const { rows } = await this.db.query(
        `SELECT e.*, c.name as category_name
        FROM equipment e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.id = $1 AND e.user_id = $2`,
        [id, userId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const equipment = rows[0];
      
      // Get equipment images
      const { rows: images } = await this.db.query(
        'SELECT id, image_url, is_primary FROM equipment_images WHERE equipment_id = $1',
        [id]
      );
      equipment.images = images;
      
      // Get specifications
      const { rows: specs } = await this.db.query(
        'SELECT id, name, value FROM specifications WHERE equipment_id = $1',
        [id]
      );
      equipment.specifications = specs;
      
      // Get maintenance records
      const { rows: maintenance } = await this.db.query(
        `SELECT m.*, mt.name as maintenance_type_name
        FROM maintenance_records m
        LEFT JOIN maintenance_types mt ON m.maintenance_type = mt.name
        WHERE m.equipment_id = $1
        ORDER BY m.date_performed DESC`,
        [id]
      );
      equipment.maintenance = maintenance;
      
      // Get usage logs
      const { rows: usage } = await this.db.query(
        'SELECT * FROM usage_logs WHERE equipment_id = $1 ORDER BY start_date DESC',
        [id]
      );
      equipment.usage = usage;
      
      // Get condition logs
      const { rows: conditions } = await this.db.query(
        'SELECT * FROM condition_logs WHERE equipment_id = $1 ORDER BY created_at DESC',
        [id]
      );
      equipment.conditions = conditions;
      
      return equipment;
    } catch (err) {
      throw new Error(`Error fetching equipment details: ${err.message}`);
    }
  }

  /**
   * Create a new equipment item
   * @param {Object} equipmentData - Equipment data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created equipment
   */
  async createEquipment(equipmentData, userId) {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert equipment
      const { rows } = await client.query(
        `INSERT INTO equipment (
          id, user_id, name, category_id, brand, model, serial_number,
          purchase_date, purchase_price, current_value, condition_rating, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          uuidv4(),
          userId,
          equipmentData.name,
          equipmentData.categoryId,
          equipmentData.brand || null,
          equipmentData.model || null,
          equipmentData.serialNumber || null,
          equipmentData.purchaseDate || null,
          equipmentData.purchasePrice || null,
          equipmentData.currentValue || null,
          equipmentData.conditionRating || null,
          equipmentData.notes || null
        ]
      );
      
      const newEquipment = rows[0];
      
      // Insert specifications if provided
      if (equipmentData.specifications && equipmentData.specifications.length > 0) {
        const specValues = equipmentData.specifications.map(spec => {
          return `('${uuidv4()}', '${newEquipment.id}', '${spec.name}', '${spec.value}')`;
        }).join(', ');
        
        await client.query(`
          INSERT INTO specifications (id, equipment_id, name, value)
          VALUES ${specValues}
        `);
      }
      
      // Insert images if provided
      if (equipmentData.images && equipmentData.images.length > 0) {
        const imageValues = equipmentData.images.map(image => {
          return `('${uuidv4()}', '${newEquipment.id}', '${image.url}', ${image.isPrimary || false})`;
        }).join(', ');
        
        await client.query(`
          INSERT INTO equipment_images (id, equipment_id, image_url, is_primary)
          VALUES ${imageValues}
        `);
      }
      
      await client.query('COMMIT');
      
      // Return the created equipment with full details
      return this.getEquipmentById(newEquipment.id, userId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Error creating equipment: ${err.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Update an equipment item
   * @param {string} id - Equipment ID
   * @param {Object} equipmentData - Updated equipment data
   * @param {string} userId - User ID for authorization
   * @returns {Promise<Object>} - Updated equipment
   */
  async updateEquipment(id, equipmentData, userId) {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if equipment exists and belongs to user
      const { rows: existing } = await client.query(
        'SELECT id FROM equipment WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (existing.length === 0) {
        throw new Error('Equipment not found or unauthorized');
      }
      
      // Update equipment
      const { rows } = await client.query(
        `UPDATE equipment SET
          name = COALESCE($1, name),
          category_id = COALESCE($2, category_id),
          brand = COALESCE($3, brand),
          model = COALESCE($4, model),
          serial_number = COALESCE($5, serial_number),
          purchase_date = COALESCE($6, purchase_date),
          purchase_price = COALESCE($7, purchase_price),
          current_value = COALESCE($8, current_value),
          condition_rating = COALESCE($9, condition_rating),
          notes = COALESCE($10, notes),
          updated_at = NOW()
        WHERE id = $11 AND user_id = $12
        RETURNING *`,
        [
          equipmentData.name,
          equipmentData.categoryId,
          equipmentData.brand,
          equipmentData.model,
          equipmentData.serialNumber,
          equipmentData.purchaseDate,
          equipmentData.purchasePrice,
          equipmentData.currentValue,
          equipmentData.conditionRating,
          equipmentData.notes,
          id,
          userId
        ]
      );
      
      // Handle specifications if provided
      if (equipmentData.specifications) {
        // Delete existing specifications
        await client.query('DELETE FROM specifications WHERE equipment_id = $1', [id]);
        
        // Insert new specifications
        if (equipmentData.specifications.length > 0) {
          const specValues = equipmentData.specifications.map(spec => {
            return `('${uuidv4()}', '${id}', '${spec.name}', '${spec.value}')`;
          }).join(', ');
          
          await client.query(`
            INSERT INTO specifications (id, equipment_id, name, value)
            VALUES ${specValues}
          `);
        }
      }
      
      await client.query('COMMIT');
      
      // Return the updated equipment with full details
      return this.getEquipmentById(id, userId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Error updating equipment: ${err.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Delete an equipment item
   * @param {string} id - Equipment ID
   * @param {string} userId - User ID for authorization
   * @returns {Promise<boolean>} - Success status
   */
  async deleteEquipment(id, userId) {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if equipment exists and belongs to user
      const { rows: existing } = await client.query(
        'SELECT id FROM equipment WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (existing.length === 0) {
        throw new Error('Equipment not found or unauthorized');
      }
      
      // Delete related records
      await client.query('DELETE FROM specifications WHERE equipment_id = $1', [id]);
      await client.query('DELETE FROM equipment_images WHERE equipment_id = $1', [id]);
      await client.query('DELETE FROM maintenance_records WHERE equipment_id = $1', [id]);
      await client.query('DELETE FROM usage_logs WHERE equipment_id = $1', [id]);
      await client.query('DELETE FROM condition_logs WHERE equipment_id = $1', [id]);
      
      // Delete the equipment
      await client.query('DELETE FROM equipment WHERE id = $1 AND user_id = $2', [id, userId]);
      
      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Error deleting equipment: ${err.message}`);
    } finally {
      client.release();
    }
  }
}

module.exports = EquipmentModel;