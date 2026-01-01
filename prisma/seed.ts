// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Début du seeding...')

  // 1. Création des catégories
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Électronique',
        slug: 'electronique',
        description: 'Produits électroniques et high-tech',
        order: 1,
        isActive: true,
      },
      {
        name: 'Téléphones & Tablettes',
        slug: 'telephones-tablettes',
        description: 'Smartphones et tablettes',
        order: 2,
        isActive: true,
      },
      {
        name: 'Mode Homme',
        slug: 'mode-homme',
        description: 'Vêtements et accessoires pour homme',
        order: 3,
        isActive: true,
      },
      {
        name: 'Mode Femme',
        slug: 'mode-femme',
        description: 'Vêtements et accessoires pour femme',
        order: 4,
        isActive: true,
      },
      {
        name: 'Maison & Cuisine',
        slug: 'maison-cuisine',
        description: 'Articles pour la maison et la cuisine',
        order: 5,
        isActive: true,
      },
    ],
  })

  // 2. Création des produits
  const smartphoneCategory = await prisma.category.findFirst({
    where: { slug: 'telephones-tablettes' }
  })

  const electroniqueCategory = await prisma.category.findFirst({
    where: { slug: 'electronique' }
  })

  if (smartphoneCategory && electroniqueCategory) {
    // Produit 1: Smartphone
    const smartphone = await prisma.product.create({
      data: {
        name: 'Smartphone Android 128GB',
        slug: 'smartphone-android-128gb',
        description: 'Smartphone Android haute performance avec 128GB de stockage',
        summary: 'Écran 6.5", 128GB, Appareil photo 48MP',
        price: 89900,
        comparePrice: 99900,
        costPrice: 65000,
        sku: 'PHN-AND-128',
        quantity: 50,
        trackQuantity: true,
        allowOutOfStockPurchase: false,
        weight: 0.18,
        dimensions: '16x8x0.8',
        categoryId: smartphoneCategory.id,
        seoTitle: 'Smartphone Android 128GB - Meilleur Prix',
        seoDescription: 'Achetez le smartphone Android 128GB au meilleur prix',
        status: 'ACTIVE',
        isFeatured: true,
        hasBulkPricing: true,
      },
    })

    // Règles de prix groupé pour le smartphone
    await prisma.bulkPricingRule.create({
      data: {
        productId: smartphone.id,
        minQuantity: 3,
        pricingType: 'PERCENTAGE',
        value: 10,
        calculatedUnitPrice: 80910,
        isActive: true,
        priority: 1,
      },
    })

    // Images du smartphone
    await prisma.productImage.createMany({
      data: [
        {
          productId: smartphone.id,
          url: 'https://example.com/images/phone1.jpg',
          alt: 'Smartphone Android vue de face',
          order: 1,
        },
        {
          productId: smartphone.id,
          url: 'https://example.com/images/phone2.jpg',
          alt: 'Smartphone Android vue arrière',
          order: 2,
        },
      ],
    })

    // Produit 2: Casque Bluetooth
    const casque = await prisma.product.create({
      data: {
        name: 'Casque Bluetooth Sans Fil',
        slug: 'casque-bluetooth-sans-fil',
        description: 'Casque audio Bluetooth avec réduction de bruit',
        summary: 'Bluetooth 5.0, Autonomie 30h, Réduction de bruit',
        price: 45000,
        comparePrice: 55000,
        costPrice: 32000,
        sku: 'AUD-BT-001',
        quantity: 25,
        trackQuantity: true,
        allowOutOfStockPurchase: false,
        weight: 0.25,
        dimensions: '18x15x8',
        categoryId: electroniqueCategory.id,
        seoTitle: 'Casque Bluetooth - Réduction de Bruit',
        seoDescription: 'Casque Bluetooth avec réduction de bruit active',
        status: 'ACTIVE',
        isFeatured: false,
        hasBulkPricing: false,
      },
    })

    // 3. Création des utilisateurs
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        phone: '+237612345678',
        password: '$2b$10$ExampleHashedPassword', // En production, hash réel
        firstName: 'Admin',
        lastName: 'System',
        role: 'ADMIN',
        status: 'ACTIVE',
        frequentPaymentNumbers: ['+237612345678', '+237698765432'],
      },
    })

    const customerUser = await prisma.user.create({
      data: {
        email: 'client@example.com',
        phone: '+237698765432',
        password: '$2b$10$ExampleHashedPassword',
        firstName: 'Jean',
        lastName: 'Client',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        frequentPaymentNumbers: ['+237698765432'],
      },
    })

    // 4. Création d'adresse pour le client
    const address = await prisma.address.create({
      data: {
        userId: customerUser.id,
        title: 'Maison',
        firstName: 'Jean',
        lastName: 'Client',
        phone: '+237698765432',
        address: 'Rue 123, Quartier Central',
        city: 'Douala',
        region: 'DOUALA',
        country: 'Cameroun',
        isDefault: true,
      },
    })

    // 5. Création d'un discount
    const discount = await prisma.discount.create({
      data: {
        name: 'Remise de bienvenue',
        description: '10% de réduction sur votre première commande',
        code: 'BIENVENUE10',
        type: 'PERCENTAGE',
        value: 10,
        minimumAmount: 10000,
        usageLimit: 100,
        perUserLimit: 1,
        scope: 'ENTIRE_ORDER',
        targetProductIds: [],
        targetCategoryIds: [],
        excludedProductIds: [],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
      },
    })

    // 6. Création d'un driver
    const driver = await prisma.driver.create({
      data: {
        firstName: 'Pierre',
        lastName: 'Livreur',
        email: 'driver@example.com',
        phone: '+237655443322',
        vehicleType: 'Moto',
        vehiclePlate: 'CE1234AB',
        vehicleColor: 'Rouge',
        regions: ['DOUALA', 'YAOUNDE'],
        status: 'ACTIVE',
        isOnline: true,
        currentLocation: 'Douala, Bonapriso',
        completedDeliveries: 0,
        rating: 4.5,
      },
    })

    console.log('Seeding terminé avec succès!')
  }
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })