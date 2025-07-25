require('dotenv').config({ path: '../../.env' });

const { products } = require('../models/products');

const seedProducts = async () => {
  try {

    const hardwareProducts = [
      // Graphics Cards
      {
        name: 'NVIDIA GeForce RTX 4090',
        quantity: 15,
        description: 'The ultimate GPU for 4K gaming and content creation. 24GB GDDR6X memory, ray tracing, DLSS 3.0 support.',
        category: 'GPU',
        photo: 'https://elbadrgroupeg.store/image/cache/catalog/msi/IsvZJCixJGziAxpbkCvH3uQuPXPo8yytsZG2lU-1280x960.png',
        price: 159999
      },
      {
        name: 'NVIDIA GeForce RTX 4080',
        quantity: 25,
        description: 'High-performance gaming GPU with 16GB GDDR6X memory, perfect for 1440p and 4K gaming.',
        category: 'GPU',
        photo: 'https://media.ldlc.com/r1600/ld/products/00/06/09/61/LD0006096161.jpg',
        price: 119999
      },
      {
        name: 'AMD Radeon RX 7900 XTX',
        quantity: 20,
        description: 'AMD flagship GPU with 24GB GDDR6 memory, excellent for high-resolution gaming and workloads.',
        category: 'GPU',
        photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1rOjQaVrRzY-T_N4hNSMDzYhpA0dj-EYHtQ&s',
        price: 99999
      },
      {
        name: 'NVIDIA GeForce RTX 4060',
        quantity: 40,
        description: 'Mid-range GPU perfect for 1080p gaming with ray tracing and DLSS support.',
        category: 'GPU',
        photo: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/10/8317721/1.jpg?7565',
        price: 29999
      },

      // CPUs
      {
        name: 'Intel Core i9-13900K',
        quantity: 30,
        description: '24-core processor with 32 threads, 5.8GHz boost clock. Perfect for gaming and productivity.',
        category: 'CPU',
        photo: 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/25/576528/1.jpg?3710',
        price: 58999
      },
      {
        name: 'AMD Ryzen 9 7950X',
        quantity: 25,
        description: '16-core, 32-thread processor with 5.7GHz boost. Excellent for content creation and gaming.',
        category: 'CPU',
        photo: 'https://elmatjr.com/wp-content/uploads/2024/04/r-9.jpg',
        price: 69999
      },
      {
        name: 'Intel Core i7-13700K',
        quantity: 35,
        description: '16-core processor with 24 threads, great balance of gaming and productivity performance.',
        category: 'CPU',
        photo: 'https://m.media-amazon.com/images/I/61m0zH-NiTL._UF894,1000_QL80_.jpg',
        price: 40999
      },
      {
        name: 'AMD Ryzen 7 7700X',
        quantity: 30,
        description: '8-core, 16-thread processor with 5.4GHz boost. Perfect for gaming and streaming.',
        category: 'CPU',
        photo: 'https://www.bhphotovideo.com/images/fb/intel_bx80677i77700k_core_i7_7700k_4_5_ghz_1304295.jpg',
        price: 39999
      },

      // Motherboards
      {
        name: 'ASUS ROG Strix Z790-E Gaming',
        quantity: 20,
        description: 'Premium Intel Z790 motherboard with WiFi 6E, PCIe 5.0, DDR5 support.',
        category: 'Motherboard',
        photo: 'https://www.abcshop-eg.com/web/image/product.image/4945/image_1024/ASUS%20ROG%20STRIX%20GAMING%20Z790%20E%20WIFI%20II?unique=4350a27',
        price: 49999
      },
      {
        name: 'MSI MAG B650 Tomahawk WiFi',
        quantity: 25,
        description: 'AMD B650 motherboard with WiFi 6, PCIe 4.0, perfect for Ryzen 7000 series.',
        category: 'Motherboard',
        photo: 'https://m.media-amazon.com/images/I/810B933Y5uL._UF894,1000_QL80_.jpg',
        price: 24999
      },

      // RAM
      {
        name: 'Corsair Vengeance DDR5-5600 32GB',
        quantity: 50,
        description: '32GB (2x16GB) DDR5 memory kit with 5600MHz speed, optimized for Intel and AMD.',
        category: 'RAM',
        photo: 'https://www.bhphotovideo.com/images/fb/corsair_cmk32gx5m2b5600c40_vengeance_32gb_2x16gb_ddr5_1808716.jpg',
        price: 17999
      },
      {
        name: 'G.Skill Trident Z5 DDR5-6000 16GB',
        quantity: 40,
        description: '16GB (2x8GB) high-speed DDR5 memory with RGB lighting.',
        category: 'RAM',
        photo: 'https://m.media-amazon.com/images/I/61bc6zvEIIL.jpg',
        price: 12999
      },

      // Storage
      {
        name: 'Samsung 980 PRO 2TB NVMe SSD',
        quantity: 35,
        description: 'PCIe 4.0 NVMe SSD with 7000MB/s read speeds, perfect for gaming and professional work.',
        category: 'Storage',
        photo: 'https://pcper.com/wp-content/uploads/2021/02/samsung-980-pro-2tb-0499.jpg',
        price: 19999
      },
      {
        name: 'WD Black SN850X 1TB NVMe SSD',
        quantity: 45,
        description: 'High-performance PCIe 4.0 SSD optimized for gaming with heatsink included.',
        category: 'Storage',
        photo: 'https://images.novatech.co.uk/western_digital-wds100t2xhe_extra2.jpg',
        price: 10999
      },
      {
        name: 'Seagate Barracuda 4TB HDD',
        quantity: 30,
        description: '4TB traditional hard drive for mass storage, 7200 RPM, 256MB cache.',
        category: 'Storage',
        photo: 'https://www.shoppingexpress.com.au/assets/full/ST4000DM004.jpg',
        price: 8999
      },

      // Power Supplies
      {
        name: 'Corsair RM850x 850W 80+ Gold',
        quantity: 25,
        description: 'Fully modular 850W power supply with 80+ Gold efficiency and 10-year warranty.',
        category: 'PSU',
        photo: 'https://images10.newegg.com/NeweggImage/ProductImage/17-139-141-08.jpg',
        price: 13999
      },
      {
        name: 'EVGA SuperNOVA 750W 80+ Platinum',
        quantity: 30,
        description: '750W fully modular PSU with 80+ Platinum efficiency, perfect for high-end builds.',
        category: 'PSU',
        photo: 'https://images.evga.com/products/gallery/png/220-P6-0750-X1_XL_8.png',
        price: 11999
      },

      // Cases
      {
        name: 'Fractal Design Define 7 Compact',
        quantity: 15,
        description: 'Compact mid-tower case with excellent airflow and noise dampening.',
        category: 'Case',
        photo: 'https://www.fractal-design.com/app/uploads/2020/12/Define_7_TGD_Black_Compact_Left_Front-1200x1200.jpg',
        price: 10999
      },
      {
        name: 'NZXT H7 RGB',
        quantity: 20,
        description: 'Modern mid-tower case with tempered glass panel and RGB lighting.',
        category: 'Case',
        photo: 'https://tms.co.il/image/cache/catalog/products/CM-H72FW-R1/AXj5OT0KcV-450x450.jpg',
        price: 14999
      },

      // Cooling
      {
        name: 'Noctua NH-D15 CPU Cooler',
        quantity: 25,
        description: 'Premium dual-tower air cooler with excellent cooling performance and low noise.',
        category: 'Cooling',
        photo: 'https://m.media-amazon.com/images/I/91t48GBv8TL.jpg',
        price: 9999
      },
      {
        name: 'Corsair H150i Elite Capellix AIO',
        quantity: 20,
        description: '360mm liquid CPU cooler with RGB lighting and magnetic levitation fans.',
        category: 'Cooling',
        photo: 'https://images.anandtech.com/doci/16169/CORSAIR_H150i_ELITE_CAPELLIX_12_575px.jpg',
        price: 18999
      }
    ];

    // Bulk create products
    await products.bulkCreate(hardwareProducts);
    console.log('✅ Products seeded successfully');
    console.log(`📦 Created ${hardwareProducts.length} hardware products`);
    console.log('🛠️  Categories: GPU, CPU, Motherboard, RAM, Storage, PSU, Case, Cooling');
    console.log('📸 All products include photo URLs');

  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    throw error;
  }
};

module.exports = { seedProducts };