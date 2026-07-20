import type {
  User,
  EventRecord,
  Attendee,
  FloorPlan,
  TaskItem,
} from "@/lib/types";

// Demo credentials (shown on the /login screen so graders/reviewers can sign in):
//   Staff/planner accounts — password: "password123", PIN: see below
//   Vendor accounts        — password: "password123", PIN: see below

export function seedUsers(): User[] {
  return [
    {
      id: "u_admin",
      name: "Sarah Mitchell",
      email: "admin@lipscomb.edu",
      password: "password123",
      pin: "1234",
      role: "admin",
      createdAt: "2026-01-05T09:00:00.000Z",
    },
    {
      id: "u_planner",
      name: "James Carter",
      email: "planner@lipscomb.edu",
      password: "password123",
      pin: "2345",
      role: "planner",
      createdAt: "2026-01-05T09:00:00.000Z",
    },
    {
      id: "u_staff",
      name: "Emma Davis",
      email: "staff@lipscomb.edu",
      password: "password123",
      pin: "3456",
      role: "staff",
      createdAt: "2026-01-06T09:00:00.000Z",
    },
    {
      id: "u_vendor1",
      name: "Marcus Lee",
      email: "vendor@lipscomb.edu",
      password: "password123",
      pin: "9999",
      role: "vendor",
      attendeeId: "a_lee",
      createdAt: "2026-02-01T09:00:00.000Z",
    },
    {
      id: "u_vendor2",
      name: "Ana Torres",
      email: "vendor2@lipscomb.edu",
      password: "password123",
      pin: "8888",
      role: "vendor",
      attendeeId: "a_torres",
      createdAt: "2026-02-02T09:00:00.000Z",
    },    {
      id: "u_rstillman",
      name: "Richard Stillman",
      email: "rastillman@mail.lipscomb.edu",
      password: "password123",
      pin: "4444",
      role: "admin",
      createdAt: "2026-07-15T00:00:00.000Z",
    },
    {
      id: "u_ktavi",
      name: "Kyle Tavi",
      email: "kyletavi@gmail.com",
      password: "password123",
      pin: "5555",
      role: "admin",
      createdAt: "2026-07-15T00:00:00.000Z",
    },
    {
      id: "u_gcarlson",
      name: "George Carlson",
      email: "georgec4444@yahoo.com",
      password: "password123",
      pin: "6666",
      role: "admin",
      createdAt: "2026-07-15T00:00:00.000Z",
    },
    {
      id: "u_cbutler",
      name: "Connor Butler",
      email: "cjbutler@lipscomb.edu",
      password: "password123",
      pin: "7777",
      role: "admin",
      createdAt: "2026-07-15T00:00:00.000Z",
    },
  ];
}

export function seedAttendees(): Attendee[] {
  return [
    {
      id: "a_lee",
      name: "Marcus Lee",
      businessName: "Lee's BBQ Co.",
      email: "vendor@lipscomb.edu",
      phone: "615-555-0101",
      category: "Food & Beverage",
    },
    {
      id: "a_torres",
      name: "Ana Torres",
      businessName: "Torres Handmade Pottery",
      email: "vendor2@lipscomb.edu",
      phone: "615-555-0102",
      category: "Arts & Crafts",
    },
    {
      id: "a_bright",
      name: "Devon Bright",
      businessName: "Bright Leaf Coffee Roasters",
      email: "devon@brightleaf.example.com",
      phone: "615-555-0103",
      category: "Food & Beverage",
    },
    {
      id: "a_nguyen",
      name: "Linh Nguyen",
      businessName: "Nguyen Family Farms",
      email: "linh@nguyenfarms.example.com",
      phone: "615-555-0104",
      category: "Produce",
    },
    {
      id: "a_patel",
      name: "Raj Patel",
      businessName: "Patel Books & Gifts",
      email: "raj@patelbooks.example.com",
      phone: "615-555-0105",
      category: "Retail",
    },
    {
      id: "a_wilson",
      name: "Grace Wilson",
      businessName: "Wilson Woodworks",
      email: "grace@wilsonwoodworks.example.com",
      phone: "615-555-0106",
      category: "Arts & Crafts",
    },
  ];
}

export function seedFloorPlans(): FloorPlan[] {
  const marketSpaces = [
    { id: "s1", label: "A1", type: "booth" as const, x: 40, y: 40, w: 100, h: 80, status: "available" as const, price: 75 },
    { id: "s2", label: "A2", type: "booth" as const, x: 160, y: 40, w: 100, h: 80, status: "reserved" as const, price: 75 },
    { id: "s3", label: "A3", type: "booth" as const, x: 280, y: 40, w: 100, h: 80, status: "available" as const, price: 75 },
    { id: "s4", label: "A4", type: "booth" as const, x: 400, y: 40, w: 100, h: 80, status: "available" as const, price: 75 },
    { id: "s5", label: "B1", type: "booth" as const, x: 40, y: 160, w: 100, h: 80, status: "available" as const, price: 65 },
    { id: "s6", label: "B2", type: "booth" as const, x: 160, y: 160, w: 100, h: 80, status: "reserved" as const, price: 65 },
    { id: "s7", label: "B3", type: "booth" as const, x: 280, y: 160, w: 100, h: 80, status: "blocked" as const, price: 65 },
    { id: "s8", label: "B4", type: "booth" as const, x: 400, y: 160, w: 100, h: 80, status: "available" as const, price: 65 },
    { id: "stage", label: "Main Stage", type: "stage" as const, x: 220, y: 280, w: 200, h: 60, status: "blocked" as const },
    { id: "entrance", label: "Entrance", type: "entrance" as const, x: 240, y: 10, w: 100, h: 20, status: "blocked" as const },
  ];

  return [
    {
      id: "fp_spring_market",
      name: "Bison Spring Market Layout",
      isTemplate: false,
      canvasWidth: 560,
      canvasHeight: 360,
      spaces: marketSpaces,
    },
    {
      id: "fp_template_grid",
      name: "Template: 12-Booth Grid",
      isTemplate: true,
      canvasWidth: 560,
      canvasHeight: 320,
      spaces: [0, 1, 2, 3].flatMap((row) =>
        [0, 1, 2].map((col) => ({
          id: `t_${row}_${col}`,
          label: `${String.fromCharCode(65 + row)}${col + 1}`,
          type: "booth" as const,
          x: 40 + col * 160,
          y: 40 + row * 70,
          w: 130,
          h: 55,
          status: "available" as const,
          price: 50,
        }))
      ),
    },
    {
      id: "fp_template_uhall",
      name: "Template: U-Shaped Hall",
      isTemplate: true,
      canvasWidth: 560,
      canvasHeight: 360,
      spaces: [
        { id: "u1", label: "L1", type: "booth" as const, x: 30, y: 40, w: 90, h: 70, status: "available" as const, price: 60 },
        { id: "u2", label: "L2", type: "booth" as const, x: 30, y: 130, w: 90, h: 70, status: "available" as const, price: 60 },
        { id: "u3", label: "L3", type: "booth" as const, x: 30, y: 220, w: 90, h: 70, status: "available" as const, price: 60 },
        { id: "u4", label: "R1", type: "booth" as const, x: 440, y: 40, w: 90, h: 70, status: "available" as const, price: 60 },
        { id: "u5", label: "R2", type: "booth" as const, x: 440, y: 130, w: 90, h: 70, status: "available" as const, price: 60 },
        { id: "u6", label: "R3", type: "booth" as const, x: 440, y: 220, w: 90, h: 70, status: "available" as const, price: 60 },
        { id: "u7", label: "B1", type: "booth" as const, x: 160, y: 260, w: 100, h: 70, status: "available" as const, price: 55 },
        { id: "u8", label: "B2", type: "booth" as const, x: 280, y: 260, w: 100, h: 70, status: "available" as const, price: 55 },
        { id: "ustage", label: "Stage", type: "stage" as const, x: 180, y: 30, w: 200, h: 60, status: "blocked" as const },
      ],
    },
  ];
}

export function seedEvents(): EventRecord[] {
  return [
    {
      id: "e_spring_market",
      name: "Bison Spring Market",
      description:
        "An open-air vendor market on the Lipscomb lawn featuring local food, crafts, and student organizations.",
      category: "Market",
      date: "2026-04-11T15:00:00.000Z",
      location: "Lipscomb Lawn",
      capacity: 8,
      status: "Open",
      floorPlanId: "fp_spring_market",
      createdAt: "2026-02-01T00:00:00.000Z",
    },
    {
      id: "e_family_weekend",
      name: "Bison Family Weekend Festival",
      description: "Festival for families visiting during Family Weekend, with games, food trucks, and vendor booths.",
      category: "Festival",
      date: "2026-05-02T16:00:00.000Z",
      location: "Student Green",
      capacity: 40,
      status: "Open",
      createdAt: "2026-02-10T00:00:00.000Z",
    },
    {
      id: "e_homecoming_fair",
      name: "Homecoming Vendor Fair",
      description: "Vendor fair held during Homecoming week, open to alumni-owned businesses.",
      category: "Fair",
      date: "2026-10-17T17:00:00.000Z",
      location: "Allen Arena Concourse",
      capacity: 25,
      status: "Draft",
      createdAt: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "e_fall_craft",
      name: "Fall Craft Fair",
      description: "A cozy, small-capacity craft fair to test out the new registration flow before scaling up.",
      category: "Fair",
      date: "2026-11-07T16:00:00.000Z",
      location: "Ezell Center",
      capacity: 3,
      status: "Open",
      createdAt: "2026-06-15T00:00:00.000Z",
    },
    {
      id: "e_alumni_gala",
      name: "Alumni Gala",
      description: "Formal gala for graduating alumni and major donors.",
      category: "Gala",
      date: "2026-03-01T23:00:00.000Z",
      location: "Bison Square",
      capacity: 150,
      status: "Completed",
      createdAt: "2025-12-01T00:00:00.000Z",
    },
  ];
}

export function seedTasks(): TaskItem[] {
  return [
    {
      id: "task1",
      title: "Confirm catering headcount for Spring Market",
      detail: "Send final attendee count to Bistro catering by end of week.",
      done: false,
      eventId: "e_spring_market",
    },
    {
      id: "task2",
      title: "Finalize floor plan for Family Weekend Festival",
      detail: "Choose a template and mark stage + food truck zones.",
      done: false,
      eventId: "e_family_weekend",
    },
    {
      id: "task3",
      title: "Publish Homecoming Vendor Fair to vendors",
      detail: "Move status from Draft to Open once sponsorship is confirmed.",
      done: false,
      eventId: "e_homecoming_fair",
    },
    {
      id: "task4",
      title: "Send reminder emails for Fall Craft Fair",
      detail: "Reminders should go out 24 hours before the event.",
      done: false,
      eventId: "e_fall_craft",
    },
    {
      id: "task5",
      title: "Archive Alumni Gala registration data",
      detail: "Event is complete — export final attendance for the board report.",
      done: true,
      eventId: "e_alumni_gala",
    },
  ];
}
