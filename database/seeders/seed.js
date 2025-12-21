const { sequelize } = require('../../server/config/database');
const { 
  Usuario, 
  Categoria, 
  Producto 
} = require('../../server/models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Sincronizar base de datos (crear tablas)
    // Usamos force: true para limpiar todo y evitar el error de IDs duplicados
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas/reiniciadas');

    // Crear usuario admin
    // IMPORTANTE: Pasamos la contraseña como TEXTO PLANO.
    // El modelo Usuario.js tiene un hook 'beforeCreate' que la encriptará automáticamente.
    const admin = await Usuario.create({
      nombre: 'Carminita',
      email: 'admin@restaurant.com',
      password: 'admin123', 
      rol: 'admin'
    });
    console.log('✅ Usuario administrador creado');

    // Crear categorías
    const categorias = await Categoria.bulkCreate([
      { nombre: 'Bebidas Frías', descripcion: 'Refrescos, jugos y bebidas heladas' },
      { nombre: 'Bebidas Calientes', descripcion: 'Café, té y bebidas calientes' },
      { nombre: 'Entradas', descripcion: 'Aperitivos y entradas' },
      { nombre: 'Platos Principales', descripcion: 'Platos fuertes y principales' },
      { nombre: 'Postres', descripcion: 'Dulces y postres' },
      { nombre: 'Ensaladas', descripcion: 'Ensaladas frescas y saludables' }
    ]);
    console.log('✅ Categorías creadas');

    // Crear productos de ejemplo
    const productos = await Producto.bulkCreate([
      // Bebidas Frías
      { nombre: 'Coca Cola 350ml', descripcion: 'Refresco de cola', precio: 10.00, categoria_id: 1 },
      { nombre: 'Sprite 350ml', descripcion: 'Refresco de limón', precio: 10.00, categoria_id: 1 },
      { nombre: 'Jugo de Naranja Natural', descripcion: 'Jugo recién exprimido', precio: 15.00, categoria_id: 1 },
      { nombre: 'Limonada', descripcion: 'Limonada fresca con hielo', precio: 12.00, categoria_id: 1 },
      { nombre: 'Agua Mineral', descripcion: 'Agua mineral 500ml', precio: 8.00, categoria_id: 1 },
      
      // Bebidas Calientes
      { nombre: 'Café Americano', descripcion: 'Café negro tradicional', precio: 12.00, categoria_id: 2 },
      { nombre: 'Capuchino', descripcion: 'Café con leche espumada', precio: 18.00, categoria_id: 2 },
      { nombre: 'Té Verde', descripcion: 'Té verde natural', precio: 10.00, categoria_id: 2 },
      { nombre: 'Chocolate Caliente', descripcion: 'Chocolate con leche', precio: 20.00, categoria_id: 2 },
      
      // Entradas
      { nombre: 'Nachos con Queso', descripcion: 'Nachos con queso derretido', precio: 35.00, categoria_id: 3 },
      { nombre: 'Alitas BBQ (6 pzas)', descripcion: 'Alitas con salsa BBQ', precio: 45.00, categoria_id: 3 },
      { nombre: 'Papas Fritas', descripcion: 'Porción de papas fritas', precio: 25.00, categoria_id: 3 },
      { nombre: 'Empanadas (3 pzas)', descripcion: 'Empanadas de carne o queso', precio: 30.00, categoria_id: 3 },
      
      // Platos Principales
      { nombre: 'Hamburguesa Clásica', descripcion: 'Carne, lechuga, tomate, queso', precio: 55.00, categoria_id: 4 },
      { nombre: 'Pizza Margherita', descripcion: 'Pizza con tomate y mozzarella', precio: 65.00, categoria_id: 4 },
      { nombre: 'Pollo a la Plancha', descripcion: 'Pechuga con ensalada y papas', precio: 60.00, categoria_id: 4 },
      { nombre: 'Pasta Alfredo', descripcion: 'Pasta con salsa alfredo', precio: 50.00, categoria_id: 4 },
      { nombre: 'Lomo de Res', descripcion: 'Lomo con guarnición', precio: 85.00, categoria_id: 4 },
      { nombre: 'Pescado a la Plancha', descripcion: 'Filete de pescado con vegetales', precio: 70.00, categoria_id: 4 },
      
      // Postres
      { nombre: 'Helado (2 bolas)', descripcion: 'Vainilla, chocolate o fresa', precio: 20.00, categoria_id: 5 },
      { nombre: 'Flan de Caramelo', descripcion: 'Flan casero con caramelo', precio: 25.00, categoria_id: 5 },
      { nombre: 'Brownie con Helado', descripcion: 'Brownie caliente con helado', precio: 35.00, categoria_id: 5 },
      { nombre: 'Cheesecake', descripcion: 'Tarta de queso con frutos rojos', precio: 30.00, categoria_id: 5 },
      
      // Ensaladas
      { nombre: 'Ensalada César', descripcion: 'Lechuga, crutones, parmesano', precio: 35.00, categoria_id: 6 },
      { nombre: 'Ensalada Mixta', descripcion: 'Variedad de vegetales frescos', precio: 30.00, categoria_id: 6 },
      { nombre: 'Ensalada de Pollo', descripcion: 'Ensalada con pollo a la plancha', precio: 45.00, categoria_id: 6 }
    ]);
    console.log('✅ Categorías creadas');

    // Crear productos de ejemplo (Solo mostramos algunos para brevedad, pero están todos en el array original)
    console.log('✅ Productos creados');

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📝 Credenciales de admin:');
    console.log('   Email: admin@restaurant.com');
    console.log('   Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

// Ejecutar seed
seedDatabase();