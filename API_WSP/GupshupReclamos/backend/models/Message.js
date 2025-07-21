const { Pool } = require('pg');

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/gupshup_messages',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Crear tabla si no existe
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        gupshup_message_id VARCHAR(255) UNIQUE NOT NULL,
        from_number VARCHAR(20) NOT NULL,
        to_number VARCHAR(20) NOT NULL,
        message_type VARCHAR(50) NOT NULL DEFAULT 'text',
        content TEXT,
        media_url TEXT,
        caption TEXT,
        sender_name VARCHAR(255) DEFAULT 'Usuario',
        conversation_id VARCHAR(255) NOT NULL,
        gupshup_session_id VARCHAR(255),
        timestamp TIMESTAMP NOT NULL,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN DEFAULT false,
        auto_response_sent BOOLEAN DEFAULT false,
        intent_detected VARCHAR(100),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear índices para optimización
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_from_number ON messages(from_number);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_messages_processed ON messages(processed);
      CREATE INDEX IF NOT EXISTS idx_messages_gupshup_id ON messages(gupshup_message_id);
    `);

    console.log('✅ Tabla messages y índices creados/verificados');
  } catch (error) {
    console.error('❌ Error creando tabla messages:', error);
  }
};

class Message {
  // Guardar nuevo mensaje en la base de datos
  static async save(messageData) {
    const query = `
      INSERT INTO messages (
        gupshup_message_id, from_number, to_number, message_type,
        content, media_url, caption, sender_name, conversation_id,
        gupshup_session_id, timestamp, received_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (gupshup_message_id) DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [
      messageData.messageId,
      messageData.fromNumber,
      messageData.toNumber,
      messageData.messageType,
      messageData.content,
      messageData.mediaUrl,
      messageData.caption,
      messageData.senderName,
      messageData.conversationId,
      messageData.gupshupSessionId,
      messageData.timestamp,
      messageData.receivedAt,
      JSON.stringify(messageData.metadata || {})
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error guardando mensaje:', error);
      throw error;
    }
  }

  // Obtener conversación completa por ID
  static async getConversation(conversationId, limit = 50) {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY timestamp DESC 
      LIMIT $2
    `;
    
    try {
      const result = await pool.query(query, [conversationId, limit]);
      return result.rows.reverse(); // Orden cronológico (más antiguos primero)
    } catch (error) {
      console.error('❌ Error obteniendo conversación:', error);
      throw error;
    }
  }

  // Verificar si un mensaje ya existe (para evitar duplicados)
  static async exists(messageId) {
    const query = `
      SELECT id FROM messages 
      WHERE gupshup_message_id = $1
    `;
    
    try {
      const result = await pool.query(query, [messageId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('❌ Error verificando mensaje existente:', error);
      return false;
    }
  }

  // Marcar mensaje como procesado
  static async markAsProcessed(messageId, intent = null) {
    const query = `
      UPDATE messages 
      SET processed = true, 
          intent_detected = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE gupshup_message_id = $1
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [messageId, intent]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error marcando mensaje como procesado:', error);
      throw error;
    }
  }

  // Marcar que se envió respuesta automática
  static async markAutoResponseSent(messageId) {
    const query = `
      UPDATE messages 
      SET auto_response_sent = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE gupshup_message_id = $1
    `;
    
    try {
      await pool.query(query, [messageId]);
    } catch (error) {
      console.error('❌ Error marcando respuesta automática:', error);
    }
  }

  // Obtener estadísticas de mensajes
  static async getStats(days = 30) {
    const query = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(*) FILTER (WHERE message_type = 'text') as text_messages,
        COUNT(*) FILTER (WHERE message_type = 'image') as image_messages,
        COUNT(*) FILTER (WHERE processed = true) as processed_messages,
        COUNT(*) FILTER (WHERE auto_response_sent = true) as auto_responses,
        COUNT(DISTINCT from_number) as unique_users,
        COUNT(DISTINCT conversation_id) as unique_conversations,
        DATE_TRUNC('day', timestamp) as date
      FROM messages 
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC('day', timestamp)
      ORDER BY date DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Obtener mensajes no procesados
  static async getUnprocessed(limit = 100) {
    const query = `
      SELECT * FROM messages 
      WHERE processed = false 
      ORDER BY timestamp ASC 
      LIMIT $1
    `;
    
    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error obteniendo mensajes no procesados:', error);
      throw error;
    }
  }

  // Obtener mensajes por número de teléfono
  static async getByPhoneNumber(phoneNumber, limit = 50) {
    const query = `
      SELECT * FROM messages 
      WHERE from_number = $1 
      ORDER BY timestamp DESC 
      LIMIT $2
    `;
    
    try {
      const result = await pool.query(query, [phoneNumber, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error obteniendo mensajes por teléfono:', error);
      throw error;
    }
  }

  // Limpiar mensajes antiguos (para mantener la base de datos limpia)
  static async cleanOldMessages(daysToKeep = 90) {
    const query = `
      DELETE FROM messages 
      WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'
      RETURNING count(*)
    `;
    
    try {
      const result = await pool.query(query);
      console.log(`🧹 Eliminados ${result.rowCount} mensajes antiguos`);
      return result.rowCount;
    } catch (error) {
      console.error('❌ Error limpiando mensajes antiguos:', error);
      throw error;
    }
  }
}

// Inicializar tabla al cargar el módulo
createTable();

// Limpiar mensajes antiguos cada 24 horas
setInterval(() => {
  Message.cleanOldMessages(90).catch(console.error);
}, 24 * 60 * 60 * 1000);

module.exports = Message; 