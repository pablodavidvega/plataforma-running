// Script para inspeccionar el schema real de Supabase
// Uso: node scripts/check-schema.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const TABLES = ['users', 'activities', 'user_locations'];

async function query(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql })
  });

  // Si no existe la función exec_sql, intentamos con el endpoint de información
  if (!res.ok) return null;
  return res.json();
}

async function getSchemaViaInfoSchema() {
  // Usamos Accept-Profile para cambiar al schema information_schema
  const tables = TABLES.map(t => `'${t}'`).join(',');
  const sql = `
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN (${tables})
    ORDER BY table_name, ordinal_position
  `;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'information_schema',
      'Content-Profile': 'information_schema',
      'Prefer': 'return=representation'
    },
    body: sql
  });

  return res;
}

async function getSchemaViaOpenAPI() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Accept': 'application/openapi+json'
    }
  });

  if (!res.ok) return null;
  return res.json();
}

async function main() {
  console.log('\n📋 SCHEMA DE SUPABASE — KIPRUN\n');
  console.log('='.repeat(60));

  // Intento 1: OpenAPI spec con service role
  console.log('🔍 Leyendo schema via OpenAPI...');
  const spec = await getSchemaViaOpenAPI();

  if (spec) {
    const definitions = spec.definitions || spec.components?.schemas || {};
    let found = 0;

    for (const tableName of TABLES) {
      const def = definitions[tableName];
      if (!def) continue;
      found++;

      console.log(`\n🗂️  Tabla: ${tableName}`);
      console.log('-'.repeat(40));

      const props    = def.properties || {};
      const required = def.required   || [];

      Object.entries(props).forEach(([col, info]) => {
        const type = info.format || info.type || '?';
        const req  = required.includes(col) ? ' [NOT NULL]' : '';
        const desc = info.description ? `  ← ${info.description}` : '';
        console.log(`  • ${col.padEnd(28)} ${type}${req}${desc}`);
      });
    }

    if (found > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ Schema leído correctamente.\n');
      return;
    }
  }

  // Intento 2: pg-meta API de Supabase
  console.log('🔍 Intentando pg-meta API...');
  for (const table of TABLES) {
    const res = await fetch(
      `${SUPABASE_URL}/pg-meta/v1/columns?table_name=${table}`,
      {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        }
      }
    );

    console.log(`\n🗂️  Tabla: ${table}`);
    console.log('-'.repeat(40));

    if (!res.ok) {
      console.log(`  ❌ HTTP ${res.status}: ${res.statusText}`);
      continue;
    }

    const cols = await res.json();
    if (!Array.isArray(cols) || cols.length === 0) {
      console.log('  ⚠️  Sin columnas o respuesta inesperada:', JSON.stringify(cols).slice(0, 200));
      continue;
    }

    cols.forEach(col => {
      const nullable = col.is_nullable ? '' : ' [NOT NULL]';
      const def      = col.default_value ? ` = ${col.default_value}` : '';
      console.log(`  • ${col.name.padEnd(28)} ${col.data_type}${nullable}${def}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Listo.\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
