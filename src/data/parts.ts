export const partCategories = [
  'CPU',
  'GPU',
  'Motherboard',
  'RAM',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
  'Fans',
  'Monitors',
  'Peripherals',
] as const

export type PartCategory = (typeof partCategories)[number]
export type PartStockStatus = 'in-stock' | 'low-stock' | 'made-to-order'

export interface PartCompatibility {
  cpuSocket?: string
  ramType?: string
  motherboardFormFactor?: string
  gpuLengthMm?: number
  maxGpuLengthMm?: number
  psuWattage?: number
  tdp?: number
}

export type PartSpecs = Record<string, string | number | boolean>

export interface Part {
  id: string
  brand: string
  name: string
  category: PartCategory
  price: number
  specs: PartSpecs
  stock: PartStockStatus
  rating: number
  image: string
  compatibility: PartCompatibility
  outlet: boolean
  discountedPrice?: number
}

type PartSeed = readonly [
  id: string,
  brand: string,
  name: string,
  category: PartCategory,
  price: number,
  specs: PartSpecs,
  compatibility: PartCompatibility,
  rating: number,
  stock?: PartStockStatus,
  discountedPrice?: number,
]

const categoryImages: Record<PartCategory, string> = {
  CPU: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e',
  GPU: 'https://images.unsplash.com/photo-1591488320449-011701bb6704',
  Motherboard: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
  RAM: 'https://images.unsplash.com/photo-1562976540-1502c2145186',
  Storage: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b',
  PSU: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7',
  Case: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c',
  Cooling: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7',
  Fans: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7',
  Monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
  Peripherals: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
}

const partSeeds: PartSeed[] = [
  ['cpu-ryzen-9-9950x', 'AMD', 'Ryzen 9 9950X', 'CPU', 549, { cores: 16, threads: 32, boostClock: '5.7 GHz', socket: 'AM5' }, { cpuSocket: 'AM5', tdp: 170 }, 4.9, 'in-stock'],
  ['cpu-ryzen-7-9800x3d', 'AMD', 'Ryzen 7 9800X3D', 'CPU', 479, { cores: 8, threads: 16, boostClock: '5.2 GHz', cache: '96MB 3D V-Cache' }, { cpuSocket: 'AM5', tdp: 120 }, 5, 'in-stock'],
  ['cpu-ryzen-7-9700x', 'AMD', 'Ryzen 7 9700X', 'CPU', 329, { cores: 8, threads: 16, boostClock: '5.5 GHz' }, { cpuSocket: 'AM5', tdp: 65 }, 4.7, 'in-stock'],
  ['cpu-ryzen-5-9600x', 'AMD', 'Ryzen 5 9600X', 'CPU', 249, { cores: 6, threads: 12, boostClock: '5.4 GHz' }, { cpuSocket: 'AM5', tdp: 65 }, 4.7, 'low-stock', 219],
  ['cpu-ryzen-5-7600', 'AMD', 'Ryzen 5 7600', 'CPU', 189, { cores: 6, threads: 12, boostClock: '5.1 GHz' }, { cpuSocket: 'AM5', tdp: 65 }, 4.6, 'in-stock'],
  ['cpu-core-ultra-9-285k', 'Intel', 'Core Ultra 9 285K', 'CPU', 589, { cores: 24, threads: 24, boostClock: '5.7 GHz' }, { cpuSocket: 'LGA1851', tdp: 125 }, 4.6, 'in-stock'],

  ['gpu-rtx-5090', 'NVIDIA', 'GeForce RTX 5090 Founders Edition', 'GPU', 1999, { memory: '32GB GDDR7', boostClock: '2.41 GHz', interface: 'PCIe 5.0' }, { gpuLengthMm: 304, tdp: 575 }, 5, 'low-stock'],
  ['gpu-rtx-5080', 'ASUS', 'TUF Gaming GeForce RTX 5080 OC', 'GPU', 1299, { memory: '16GB GDDR7', boostClock: '2.73 GHz', cooling: 'Triple fan' }, { gpuLengthMm: 348, tdp: 360 }, 4.8, 'in-stock'],
  ['gpu-rtx-5070ti', 'MSI', 'GeForce RTX 5070 Ti Gaming Trio', 'GPU', 899, { memory: '16GB GDDR7', boostClock: '2.48 GHz', cooling: 'Tri Frozr 4' }, { gpuLengthMm: 338, tdp: 300 }, 4.8, 'in-stock'],
  ['gpu-rtx-5070', 'Gigabyte', 'GeForce RTX 5070 Eagle OC', 'GPU', 649, { memory: '12GB GDDR7', boostClock: '2.55 GHz', cooling: 'Triple fan' }, { gpuLengthMm: 292, tdp: 250 }, 4.6, 'low-stock', 619],
  ['gpu-rx-9070xt', 'Sapphire', 'Radeon RX 9070 XT Pulse', 'GPU', 699, { memory: '16GB GDDR6', boostClock: '2.97 GHz', cooling: 'Dual fan' }, { gpuLengthMm: 320, tdp: 304 }, 4.7, 'in-stock'],

  ['mb-x870e-ace', 'MSI', 'MEG X870E ACE', 'Motherboard', 699, { chipset: 'AMD X870E', socket: 'AM5', memorySlots: 4, wifi: 'Wi-Fi 7' }, { cpuSocket: 'AM5', ramType: 'DDR5', motherboardFormFactor: 'E-ATX' }, 4.8, 'in-stock'],
  ['mb-x870-tomahawk', 'MSI', 'MAG X870 Tomahawk WiFi', 'Motherboard', 299, { chipset: 'AMD X870', socket: 'AM5', memorySlots: 4, wifi: 'Wi-Fi 7' }, { cpuSocket: 'AM5', ramType: 'DDR5', motherboardFormFactor: 'ATX' }, 4.8, 'in-stock'],
  ['mb-b850-aorus-elite', 'Gigabyte', 'B850 AORUS Elite WiFi7', 'Motherboard', 239, { chipset: 'AMD B850', socket: 'AM5', memorySlots: 4, wifi: 'Wi-Fi 7' }, { cpuSocket: 'AM5', ramType: 'DDR5', motherboardFormFactor: 'ATX' }, 4.6, 'in-stock'],
  ['mb-b650m-pro', 'ASRock', 'B650M Pro RS WiFi', 'Motherboard', 159, { chipset: 'AMD B650', socket: 'AM5', memorySlots: 4, wifi: 'Wi-Fi 6E' }, { cpuSocket: 'AM5', ramType: 'DDR5', motherboardFormFactor: 'Micro-ATX' }, 4.5, 'low-stock', 139],
  ['mb-z890-aorus-master', 'Gigabyte', 'Z890 AORUS Master', 'Motherboard', 499, { chipset: 'Intel Z890', socket: 'LGA1851', memorySlots: 4, wifi: 'Wi-Fi 7' }, { cpuSocket: 'LGA1851', ramType: 'DDR5', motherboardFormFactor: 'ATX' }, 4.7, 'in-stock'],

  ['ram-vengeance-32-ddr5', 'Corsair', 'Vengeance 32GB DDR5-6000', 'RAM', 109, { capacity: '32GB (2x16GB)', speed: '6000 MT/s', latency: 'CL30' }, { ramType: 'DDR5' }, 4.8, 'in-stock'],
  ['ram-vengeance-64-ddr5', 'Corsair', 'Vengeance 64GB DDR5-6000', 'RAM', 199, { capacity: '64GB (2x32GB)', speed: '6000 MT/s', latency: 'CL32' }, { ramType: 'DDR5' }, 4.8, 'in-stock'],
  ['ram-trident-z5-32', 'G.Skill', 'Trident Z5 Neo RGB 32GB', 'RAM', 124, { capacity: '32GB (2x16GB)', speed: '6000 MT/s', latency: 'CL30', lighting: 'Addressable RGB' }, { ramType: 'DDR5' }, 4.7, 'in-stock'],
  ['ram-vengeance-96-ddr5', 'Corsair', 'Vengeance 96GB DDR5-5600', 'RAM', 279, { capacity: '96GB (2x48GB)', speed: '5600 MT/s', latency: 'CL40' }, { ramType: 'DDR5' }, 4.6, 'low-stock', 259],

  ['ssd-990pro-2tb', 'Samsung', '990 PRO 2TB NVMe SSD', 'Storage', 169, { capacity: '2TB', interface: 'PCIe 4.0 x4', readSpeed: '7,450 MB/s', formFactor: 'M.2 2280' }, {}, 4.9, 'in-stock'],
  ['ssd-t700-2tb', 'Crucial', 'T700 2TB PCIe 5.0 NVMe SSD', 'Storage', 259, { capacity: '2TB', interface: 'PCIe 5.0 x4', readSpeed: '12,400 MB/s', formFactor: 'M.2 2280' }, {}, 4.7, 'in-stock'],
  ['ssd-sn850x-4tb', 'Western Digital', 'Black SN850X 4TB NVMe SSD', 'Storage', 299, { capacity: '4TB', interface: 'PCIe 4.0 x4', readSpeed: '7,300 MB/s', formFactor: 'M.2 2280' }, {}, 4.8, 'low-stock'],
  ['ssd-mx500-2tb', 'Crucial', 'MX500 2TB SATA SSD', 'Storage', 139, { capacity: '2TB', interface: 'SATA III', readSpeed: '560 MB/s', formFactor: '2.5-inch' }, {}, 4.7, 'in-stock', 119],
  ['hdd-ironwolf-8tb', 'Seagate', 'IronWolf 8TB NAS HDD', 'Storage', 189, { capacity: '8TB', interface: 'SATA III', speed: '7200 RPM', cache: '256MB' }, {}, 4.6, 'in-stock'],

  ['psu-rm1000x', 'Corsair', 'RM1000x Shift 1000W', 'PSU', 219, { wattage: 1000, efficiency: '80+ Gold', modular: 'Fully modular', standard: 'ATX 3.1' }, { psuWattage: 1000 }, 4.8, 'in-stock'],
  ['psu-focus-gx850', 'Seasonic', 'Focus GX-850 ATX 3.0', 'PSU', 149, { wattage: 850, efficiency: '80+ Gold', modular: 'Fully modular', standard: 'ATX 3.0' }, { psuWattage: 850 }, 4.7, 'in-stock'],
  ['psu-pure-power-750', 'be quiet!', 'Pure Power 12 M 750W', 'PSU', 119, { wattage: 750, efficiency: '80+ Gold', modular: 'Fully modular', standard: 'ATX 3.0' }, { psuWattage: 750 }, 4.6, 'low-stock', 99],
  ['psu-prime-tx1300', 'Seasonic', 'Prime TX-1300', 'PSU', 429, { wattage: 1300, efficiency: '80+ Titanium', modular: 'Fully modular', standard: 'ATX 3.1' }, { psuWattage: 1300 }, 4.9, 'made-to-order'],

  ['case-h9-flow', 'NZXT', 'H9 Flow', 'Case', 159, { type: 'Dual-chamber mid tower', includedFans: 4, color: 'Black' }, { motherboardFormFactor: 'ATX', maxGpuLengthMm: 435 }, 4.7, 'in-stock'],
  ['case-north-xl', 'Fractal Design', 'North XL Mesh', 'Case', 189, { type: 'Full tower', includedFans: 3, color: 'Charcoal Black' }, { motherboardFormFactor: 'E-ATX', maxGpuLengthMm: 413 }, 4.8, 'in-stock'],
  ['case-lancool-216', 'Lian Li', 'Lancool 216 RGB', 'Case', 109, { type: 'Mid tower', includedFans: 3, color: 'Black' }, { motherboardFormFactor: 'ATX', maxGpuLengthMm: 392 }, 4.8, 'in-stock', 95],
  ['case-ap201', 'ASUS', 'Prime AP201 Mesh', 'Case', 79, { type: 'Micro tower', includedFans: 0, color: 'White' }, { motherboardFormFactor: 'Micro-ATX', maxGpuLengthMm: 338 }, 4.6, 'low-stock'],

  ['cooler-kraken-360', 'NZXT', 'Kraken Elite 360 RGB', 'Cooling', 299, { type: 'AIO liquid cooler', radiator: '360mm', display: '2.72-inch LCD' }, { tdp: 300 }, 4.8, 'in-stock'],
  ['cooler-arctic-360', 'ARCTIC', 'Liquid Freezer III 360', 'Cooling', 119, { type: 'AIO liquid cooler', radiator: '360mm', fans: 3 }, { tdp: 250 }, 4.8, 'in-stock'],
  ['cooler-peerless-assassin', 'Thermalright', 'Peerless Assassin 120 SE', 'Cooling', 39, { type: 'Dual-tower air cooler', fans: 2, height: '155mm' }, { tdp: 200 }, 4.8, 'in-stock', 32],
  ['cooler-dark-rock-elite', 'be quiet!', 'Dark Rock Elite', 'Cooling', 119, { type: 'Dual-tower air cooler', fans: 2, height: '168mm' }, { tdp: 280 }, 4.7, 'low-stock'],

  ['fan-p14-pwm-5pack', 'ARCTIC', 'P14 PWM PST 140mm 5-Pack', 'Fans', 45, { size: '140mm', speed: '200–1700 RPM', quantity: 5, bearing: 'Fluid dynamic' }, {}, 4.8, 'in-stock'],
  ['fan-uni-p28-120', 'Lian Li', 'UNI FAN P28 120mm Triple Pack', 'Fans', 79, { size: '120mm', speed: '200–2600 RPM', quantity: 3, bearing: 'Fluid dynamic' }, {}, 4.7, 'in-stock'],
  ['fan-phanteks-d30', 'Phanteks', 'D30-120 D-RGB 3-Pack', 'Fans', 89, { size: '120mm', speed: '250–2000 RPM', quantity: 3, lighting: 'D-RGB' }, {}, 4.7, 'low-stock', 75],
  ['fan-silent-wings-4', 'be quiet!', 'Silent Wings 4 140mm PWM', 'Fans', 29, { size: '140mm', speed: 'Up to 1100 RPM', noise: '13.6 dBA' }, {}, 4.8, 'in-stock'],

  ['monitor-lg-27gr83q', 'LG', 'UltraGear 27GR83Q-B', 'Monitors', 349, { size: '27-inch', resolution: '2560x1440', refreshRate: '240Hz', panel: 'IPS' }, {}, 4.7, 'in-stock'],
  ['monitor-samsung-g6', 'Samsung', 'Odyssey OLED G6 27-inch', 'Monitors', 899, { size: '27-inch', resolution: '2560x1440', refreshRate: '360Hz', panel: 'QD-OLED' }, {}, 4.8, 'low-stock', 799],
  ['monitor-dell-u2723qe', 'Dell', 'UltraSharp U2723QE', 'Monitors', 579, { size: '27-inch', resolution: '3840x2160', refreshRate: '60Hz', panel: 'IPS Black' }, {}, 4.7, 'in-stock'],
  ['monitor-gigabyte-m32u', 'Gigabyte', 'M32U 32-inch 4K Gaming Monitor', 'Monitors', 599, { size: '32-inch', resolution: '3840x2160', refreshRate: '144Hz', panel: 'IPS' }, {}, 4.6, 'in-stock'],

  ['peripheral-g915x', 'Logitech', 'G915 X Lightspeed TKL', 'Peripherals', 199, { type: 'Wireless mechanical keyboard', connection: 'Lightspeed / Bluetooth', layout: 'Tenkeyless' }, {}, 4.7, 'in-stock'],
  ['peripheral-deathadder-v3', 'Razer', 'DeathAdder V3 Pro', 'Peripherals', 149, { type: 'Wireless gaming mouse', sensor: 'Focus Pro 30K', weight: '63g' }, {}, 4.8, 'in-stock', 129],
  ['peripheral-arctis-nova-7', 'SteelSeries', 'Arctis Nova 7 Wireless', 'Peripherals', 179, { type: 'Wireless gaming headset', connection: '2.4GHz / Bluetooth', batteryLife: '38 hours' }, {}, 4.6, 'in-stock'],
  ['peripheral-streamdeck-mk2', 'Elgato', 'Stream Deck MK.2', 'Peripherals', 149, { type: 'Macro control pad', keys: 15, connection: 'USB-C' }, {}, 4.8, 'low-stock'],
  ['peripheral-dualsense-edge', 'Sony', 'DualSense Edge Wireless Controller', 'Peripherals', 199, { type: 'Wireless controller', connection: 'Bluetooth / USB-C', platform: 'PC / PlayStation 5' }, {}, 4.6, 'in-stock'],
  ['peripheral-hyperx-quadcast', 'HyperX', 'QuadCast 2 USB Microphone', 'Peripherals', 149, { type: 'USB condenser microphone', polarPatterns: 4, connection: 'USB-C' }, {}, 4.7, 'made-to-order'],
]

export const parts: Part[] = partSeeds.map(
  ([
    id,
    brand,
    name,
    category,
    price,
    specs,
    compatibility,
    rating,
    stock = 'in-stock',
    discountedPrice,
  ]) => ({
    id,
    brand,
    name,
    category,
    price,
    specs,
    stock,
    rating,
    image: categoryImages[category],
    compatibility,
    outlet: discountedPrice !== undefined,
    ...(discountedPrice !== undefined ? { discountedPrice } : {}),
  }),
)
