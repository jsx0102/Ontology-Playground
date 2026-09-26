// Quest system for Ontology Playground demo

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'exploration' | 'traversal' | 'query';
  steps: QuestStep[];
  reward: {
    badge: string;
    badgeIcon: string;
    points: number;
  };
}

export interface QuestStep {
  id: string;
  instruction: string;
  targetType: 'entity' | 'relationship' | 'property' | 'query';
  targetId?: string;
  hint?: string;
}

export const quests: Quest[] = [
  {
    id: "quest-1",
    title: "认识实体",
    description: "通过探索实体类型，发现 Fourth Coffee 本体的核心构建块。",
    difficulty: "beginner",
    category: "exploration",
    steps: [
      {
        id: "step-1-1",
        instruction: "点击 Customer（客户）实体，了解客户信息",
        targetType: "entity",
        targetId: "customer",
        hint: "在关系图中寻找 👤 图标"
      },
      {
        id: "step-1-2",
        instruction: "接下来探索 Product（产品）实体",
        targetType: "entity",
        targetId: "product",
        hint: "找到 ☕ 咖啡杯图标"
      },
      {
        id: "step-1-3",
        instruction: "最后看看 Store（门店）实体",
        targetType: "entity",
        targetId: "store",
        hint: "找到 🏪 门店图标"
      }
    ],
    reward: {
      badge: "实体探索者",
      badgeIcon: "🎖️",
      points: 100
    }
  },
  {
    id: "quest-2",
    title: "咖啡豆之旅",
    description: "沿着关系追踪一颗咖啡豆从供应商到客户的旅程。",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-2-1",
        instruction: "从 Supplier（供应商）实体出发——这里是咖啡豆的源头",
        targetType: "entity",
        targetId: "supplier",
        hint: "找到 🚚 卡车图标"
      },
      {
        id: "step-2-2",
        instruction: "沿着 'sourcedFrom' 关系走向 Product（产品）",
        targetType: "relationship",
        targetId: "product_sourced_from_supplier",
        hint: "点击连接 Supplier 与 Product 的连线"
      },
      {
        id: "step-2-3",
        instruction: "探索 'contains' 关系，看看产品如何出现在订单中",
        targetType: "relationship",
        targetId: "order_contains_product",
        hint: "查看 Order 与 Product 之间的连线"
      },
      {
        id: "step-2-4",
        instruction: "最后看看 'places' 关系，了解是谁下了订单",
        targetType: "relationship",
        targetId: "customer_places_order",
        hint: "找到从 Customer 到 Order 的关系"
      }
    ],
    reward: {
      badge: "咖啡豆侦探",
      badgeIcon: "🔍",
      points: 250
    }
  },
  {
    id: "quest-3",
    title: "供应链导航",
    description: "了解货运如何将供应商与门店连接起来。",
    difficulty: "intermediate",
    category: "traversal",
    steps: [
      {
        id: "step-3-1",
        instruction: "点击 Shipment（货运）实体",
        targetType: "entity",
        targetId: "shipment",
        hint: "找到 📦 包裹图标"
      },
      {
        id: "step-3-2",
        instruction: "探索通向 Supplier（供应商）的 'sentBy' 关系",
        targetType: "relationship",
        targetId: "shipment_from_supplier",
        hint: "查看货运从哪里发出"
      },
      {
        id: "step-3-3",
        instruction: "沿着通向 Store（门店）的 'deliveredTo' 关系前进",
        targetType: "relationship",
        targetId: "shipment_to_store",
        hint: "查看货运送达的目的地"
      }
    ],
    reward: {
      badge: "供应链大师",
      badgeIcon: "🌐",
      points: 200
    }
  },
  {
    id: "quest-4",
    title: "查询探索",
    description: "学习使用自然语言查询进行提问。",
    difficulty: "advanced",
    category: "query",
    steps: [
      {
        id: "step-4-1",
        instruction: "试着提问：“Show me all Gold tier customers”（显示所有金牌级客户）",
        targetType: "query",
        hint: "在查询工作台中输入"
      },
      {
        id: "step-4-2",
        instruction: "再问一个：“Which products come from Ethiopia?”（哪些产品来自埃塞俄比亚？）",
        targetType: "query",
        hint: "使用自然语言按产地筛选"
      },
      {
        id: "step-4-3",
        instruction: "试一个遍历查询：“What orders did Arif Ramadhan place?”（Arif Ramadhan 下过哪些订单？）",
        targetType: "query",
        hint: "这将沿 Customer → Order 关系进行查询"
      }
    ],
    reward: {
      badge: "查询向导",
      badgeIcon: "🧙",
      points: 300
    }
  },
  {
    id: "quest-5",
    title: "数据绑定探秘",
    description: "了解本体概念如何连接到真实的数据平台数据源。",
    difficulty: "advanced",
    category: "exploration",
    steps: [
      {
        id: "step-5-1",
        instruction: "选中 Customer（客户）实体并查看其数据绑定",
        targetType: "entity",
        targetId: "customer",
        hint: "在检查器中找到 “Data Bindings”（数据绑定）部分"
      },
      {
        id: "step-5-2",
        instruction: "查看 Customer 的属性如何映射到源数据列",
        targetType: "property",
        targetId: "name",
        hint: "注意 'name' 在源数据中映射为 'full_name'"
      },
      {
        id: "step-5-3",
        instruction: "查看 Product（产品）实体的绑定，记下其源数据和表",
        targetType: "entity",
        targetId: "product",
        hint: "查看 Product 下方的 Data Bindings 卡片"
      }
    ],
    reward: {
      badge: "绑定专家",
      badgeIcon: "🔗",
      points: 350
    }
  }
];

// Pre-defined NL query responses for demo
export interface QueryResponse {
  query: string;
  matches: string[];
  result: string;
  highlightEntities: string[];
  highlightRelationships: string[];
}

export const nlQueryResponses: QueryResponse[] = [
  {
    query: "show me all gold tier customers",
    matches: ["gold tier", "gold customers", "customers gold"],
    result: "Found 1 Gold tier customer:\n• Arif Ramadhan (CUST-001) - Gold tier since 2024",
    highlightEntities: ["customer"],
    highlightRelationships: []
  },
  {
    query: "which products come from ethiopia",
    matches: ["products ethiopia", "ethiopian", "from ethiopia"],
    result: "Found 1 product from Ethiopia:\n• Ethiopian Single Origin (☕ Brewed) - $4.50\n  Sourced from: Ethiopia Highlands Farm",
    highlightEntities: ["product", "supplier"],
    highlightRelationships: ["product_sourced_from_supplier"]
  },
  {
    query: "what orders did arif ramadhan place",
    matches: ["orders arif", "arif ramadhan orders", "arif placed"],
    result: "Arif Ramadhan's orders:\n• ORD-2025-001 - $12.50 (Completed)\n  Items: Ethiopian Single Origin x2, Colombian Latte x1\n  Store: Downtown Seattle",
    highlightEntities: ["customer", "order", "store"],
    highlightRelationships: ["customer_places_order", "order_processed_at_store"]
  },
  {
    query: "how many stores are in seattle",
    matches: ["stores seattle", "seattle stores", "how many stores"],
    result: "Found 2 stores in Seattle:\n• Fourth Coffee - Downtown Seattle (45 seats)\n• Fourth Coffee - Capitol Hill (32 seats)",
    highlightEntities: ["store"],
    highlightRelationships: []
  },
  {
    query: "show supply chain for colombian latte",
    matches: ["supply chain", "colombian latte", "where does colombian latte come from"],
    result: "Supply chain for Colombian Latte:\n• Bean Origin: Colombia 🇨🇴\n• Supplier: Colombian Mountain Roasters\n• Certification: Rainforest Alliance 🌿\n• Latest Shipment: SHIP-001 (Delivered Jan 27)",
    highlightEntities: ["product", "supplier", "shipment"],
    highlightRelationships: ["product_sourced_from_supplier", "shipment_from_supplier"]
  },
  {
    query: "what is an entity type",
    matches: ["what is entity", "entity type", "define entity"],
    result: "An Entity Type is a reusable logical model of a real-world concept (like Customer, Product, or Order). It standardizes the name, description, identifiers, and properties so every team means the same thing when using a term.",
    highlightEntities: [],
    highlightRelationships: []
  },
  {
    query: "what is a relationship",
    matches: ["what is relationship", "define relationship", "relationships"],
    result: "A Relationship is a typed, directional link between entity types. For example, 'Customer places Order' defines how customers connect to their orders. Relationships can have attributes like quantity or confidence.",
    highlightEntities: [],
    highlightRelationships: []
  },
  {
    query: "show me platinum customers",
    matches: ["platinum", "platinum customers", "customers platinum"],
    result: "Found 1 Platinum tier customer:\n• Jaroslav Cerny (CUST-002) - Platinum tier\n  Total spend: $3,420.00\n  Member since: Jan 2023",
    highlightEntities: ["customer"],
    highlightRelationships: []
  },
  {
    query: "list all organic products",
    matches: ["organic", "organic products", "is organic"],
    result: "Found 2 organic products:\n• Ethiopian Single Origin (Brewed) - $4.50 🌱\n• Nebula Cold Brew (Cold Brew) - $5.25 🌱",
    highlightEntities: ["product"],
    highlightRelationships: []
  }
];
