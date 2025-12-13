export interface SalesEntry {
  id: string;
  name: string;
  price: number;
  soldAmount: number;
  quantity: number;
  unit: string;
  status: 'active' | 'inactive';
}

export interface CashflowEntry {
  id: string;
  type: 'income' | 'expense' | 'credit';
  amount: number;
  category: string;
  description: string;
}

export interface ShiftData {
  totalSales: number;
  fuel: number;
  others: number;
  netCashflow: number;
  income: number;
  expense: number;
  credit: number;
  salesEntries: SalesEntry[];
  cashflowEntries: CashflowEntry[];
}

export interface IslandData {
  id: number;
  name: string;
  shifts: number;
  amount: number;
  positive: boolean;
  shift1: ShiftData;
  shift2: ShiftData;
}

export const ISLANDS_DATA: IslandData[] = [
  {
    id: 1,
    name: 'Island 1',
    shifts: 2,
    amount: 155000,
    positive: true,
    shift1: {
      totalSales: 155000,
      fuel: 150000,
      others: 5000,
      netCashflow: 132000,
      income: 130000,
      expense: 2000,
      credit: 4000,
      salesEntries: [
        {
          id: '1',
          name: 'MS-Petrol',
          price: 200.87,
          soldAmount: 155000,
          quantity: 400,
          unit: 'Ltr',
          status: 'active'
        },
        {
          id: '2',
          name: 'Green-001',
          price: 200.87,
          soldAmount: 0,
          quantity: 400,
          unit: 'Ltr',
          status: 'active'
        },
        {
          id: '3',
          name: 'Green-001',
          price: 200.87,
          soldAmount: 0,
          quantity: 400,
          unit: 'Ltr',
          status: 'active'
        },
        {
          id: '4',
          name: 'Green-008',
          price: 200.87,
          soldAmount: 0,
          quantity: 400,
          unit: 'Ltr',
          status: 'inactive'
        }
      ],
      cashflowEntries: [
        {
          id: '1',
          type: 'expense',
          amount: 2000,
          category: 'UPI',
          description: 'Maintenance'
        },
        {
          id: '2',
          type: 'income',
          amount: 130000,
          category: 'Cash',
          description: 'Sales'
        }
      ]
    },
    shift2: {
      totalSales: 120000,
      fuel: 115000,
      others: 5000,
      netCashflow: 105000,
      income: 110000,
      expense: 5000,
      credit: 0,
      salesEntries: [
        {
          id: '5',
          name: 'MS-Petrol',
          price: 200.87,
          soldAmount: 120000,
          quantity: 350,
          unit: 'Ltr',
          status: 'active'
        },
        {
          id: '6',
          name: 'Diesel',
          price: 180.50,
          soldAmount: 0,
          quantity: 200,
          unit: 'Ltr',
          status: 'active'
        }
      ],
      cashflowEntries: [
        {
          id: '3',
          type: 'expense',
          amount: 5000,
          category: 'Cash',
          description: 'Supplies'
        },
        {
          id: '4',
          type: 'income',
          amount: 110000,
          category: 'Cash',
          description: 'Sales'
        }
      ]
    }
  },
  {
    id: 2,
    name: 'Island 2',
    shifts: 2,
    amount: 12000,
    positive: true,
    shift1: {
      totalSales: 12000,
      fuel: 10000,
      others: 2000,
      netCashflow: 10000,
      income: 12000,
      expense: 2000,
      credit: 0,
      salesEntries: [
        {
          id: '7',
          name: 'MS-Petrol',
          price: 200.87,
          soldAmount: 10000,
          quantity: 50,
          unit: 'Ltr',
          status: 'active'
        }
      ],
      cashflowEntries: [
        {
          id: '5',
          type: 'income',
          amount: 12000,
          category: 'Cash',
          description: 'Sales'
        },
        {
          id: '6',
          type: 'expense',
          amount: 2000,
          category: 'UPI',
          description: 'Utilities'
        }
      ]
    },
    shift2: {
      totalSales: 8000,
      fuel: 7000,
      others: 1000,
      netCashflow: 6500,
      income: 8000,
      expense: 1500,
      credit: 0,
      salesEntries: [
        {
          id: '8',
          name: 'MS-Petrol',
          price: 200.87,
          soldAmount: 7000,
          quantity: 35,
          unit: 'Ltr',
          status: 'active'
        }
      ],
      cashflowEntries: [
        {
          id: '7',
          type: 'income',
          amount: 8000,
          category: 'Cash',
          description: 'Sales'
        },
        {
          id: '8',
          type: 'expense',
          amount: 1500,
          category: 'Cash',
          description: 'Maintenance'
        }
      ]
    }
  },
  {
    id: 3,
    name: 'Island 3',
    shifts: 2,
    amount: 12000,
    positive: true,
    shift1: {
      totalSales: 12000,
      fuel: 11000,
      others: 1000,
      netCashflow: 10500,
      income: 12000,
      expense: 1500,
      credit: 0,
      salesEntries: [
        {
          id: '9',
          name: 'MS-Petrol',
          price: 200.87,
          soldAmount: 11000,
          quantity: 55,
          unit: 'Ltr',
          status: 'active'
        }
      ],
      cashflowEntries: [
        {
          id: '9',
          type: 'income',
          amount: 12000,
          category: 'Cash',
          description: 'Sales'
        },
        {
          id: '10',
          type: 'expense',
          amount: 1500,
          category: 'UPI',
          description: 'Supplies'
        }
      ]
    },
    shift2: {
      totalSales: 9000,
      fuel: 8500,
      others: 500,
      netCashflow: 8000,
      income: 9000,
      expense: 1000,
      credit: 0,
      salesEntries: [
        {
          id: '10',
          name: 'MS-Petrol',
          price: 200.87,
          soldAmount: 8500,
          quantity: 42,
          unit: 'Ltr',
          status: 'active'
        }
      ],
      cashflowEntries: [
        {
          id: '11',
          type: 'income',
          amount: 9000,
          category: 'Cash',
          description: 'Sales'
        },
        {
          id: '12',
          type: 'expense',
          amount: 1000,
          category: 'Cash',
          description: 'Utilities'
        }
      ]
    }
  },
  {
    id: 4,
    name: 'Island 4',
    shifts: 2,
    amount: 12000,
    positive: false,
    shift1: {
      totalSales: 8000,
      fuel: 7000,
      others: 1000,
      netCashflow: -4000,
      income: 8000,
      expense: 12000,
      credit: 0,
      salesEntries: [
        {
          id: '11',
          name: 'MS-Petrol',
          price: 200.87,
          soldAmount: 7000,
          quantity: 35,
          unit: 'Ltr',
          status: 'active'
        }
      ],
      cashflowEntries: [
        {
          id: '13',
          type: 'income',
          amount: 8000,
          category: 'Cash',
          description: 'Sales'
        },
        {
          id: '14',
          type: 'expense',
          amount: 12000,
          category: 'UPI',
          description: 'Major Repairs'
        }
      ]
    },
    shift2: {
      totalSales: 6000,
      fuel: 5500,
      others: 500,
      netCashflow: 3000,
      income: 6000,
      expense: 3000,
      credit: 0,
      salesEntries: [
        {
          id: '12',
          name: 'MS-Petrol',
          price: 200.87,
          soldAmount: 5500,
          quantity: 27,
          unit: 'Ltr',
          status: 'active'
        }
      ],
      cashflowEntries: [
        {
          id: '15',
          type: 'income',
          amount: 6000,
          category: 'Cash',
          description: 'Sales'
        },
        {
          id: '16',
          type: 'expense',
          amount: 3000,
          category: 'Cash',
          description: 'Supplies'
        }
      ]
    }
  }
];

export function getIslandById(id: number): IslandData | undefined {
  return ISLANDS_DATA.find(island => island.id === id);
}

// Customer interface and mock data for Customer List screen
export interface Vehicle {
  id: string;
  number: string;
  type: string;
  fuelType: string;
  lastFueledDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  type: 'Credit' | 'Cash';
  creditLimit: number;
  creditUsed: number;
  outstandingAmount: number;
  vehicles?: Vehicle[];
  bills?: {
    id: string;
    date: string;
    totalAmount: number;
    paid: boolean;
    items?: {
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
  payments?: {
    id: string;
    date: string;
    amount: number;
    type: 'Credit' | 'Cash';
    method: string;
  }[];
  email?: string;
}

export const CUSTOMERS: Customer[] = [
  {
    id: '2',
    name: 'Googl',
    phone: '9842848258',
    type: 'Credit',
    creditLimit: 250000,
    creditUsed: 2357.91,
    outstandingAmount: 2357.91,
    email: 'google@gmail.com',
    vehicles: [
      {
        id: 'v1',
        number: 'KA01AB1234',
        type: 'Car',
        fuelType: 'Petrol',
        lastFueledDate: '2023-12-15'
      }
    ],
    bills: [
      {
        id: 'bill1',
        date: '2023-12-10',
        totalAmount: 1500,
        paid: false,
        items: [
          { name: 'Fuel', quantity: 5, price: 300 }
        ]
      }
    ],
    payments: [
      {
        id: 'payment1',
        date: '2023-11-25',
        amount: 5000,
        type: 'Cash',
        method: 'UPI'
      }
    ]
  },
  {
    id: '3',
    name: 'John Doe',
    phone: '9876543210',
    type: 'Credit',
    creditLimit: 150000,
    creditUsed: 45000,
    outstandingAmount: 45000,
    email: 'johndoe@example.com',
    vehicles: [
      {
        id: 'v2',
        number: 'MH02CD5678',
        type: 'SUV',
        fuelType: 'Diesel',
        lastFueledDate: '2023-12-20'
      },
      {
        id: 'v3',
        number: 'TN03EF9012',
        type: 'Bike',
        fuelType: 'Petrol',
        lastFueledDate: '2023-12-18'
      }
    ],
    bills: [
      {
        id: 'bill2',
        date: '2023-12-15',
        totalAmount: 25000,
        paid: false,
        items: [
          { name: 'Fuel', quantity: 100, price: 250 },
          { name: 'Lubricant', quantity: 2, price: 500 }
        ]
      },
      {
        id: 'bill3',
        date: '2023-11-30',
        totalAmount: 20000,
        paid: true,
        items: [
          { name: 'Fuel', quantity: 80, price: 250 }
        ]
      }
    ],
    payments: [
      {
        id: 'payment2',
        date: '2023-12-05',
        amount: 10000,
        type: 'Cash',
        method: 'Cash'
      },
      {
        id: 'payment3',
        date: '2023-11-15',
        amount: 15000,
        type: 'Cash',
        method: 'Bank Transfer'
      }
    ]
  }
]; 