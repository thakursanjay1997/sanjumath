export interface ChapterTopic {
  id: string;
  name: string;
}

export interface ChapterDetail {
  id: string;
  grade: number;
  subject: 'Mathematics' | 'Physics';
  chapterNumber: number;
  name: string;
  boardWeightage: string;
  topics: ChapterTopic[];
  keyFormulas?: string[];
  totalExpectedHours: number;
}

export const cbseSyllabusData: Record<number, { math: string[]; physics: string[] }> = {
  6: {
    math: [
      "Knowing Our Numbers",
      "Whole Numbers",
      "Playing with Numbers",
      "Basic Geometrical Ideas",
      "Understanding Elementary Shapes",
      "Integers",
      "Fractions",
      "Decimals",
      "Data Handling",
      "Mensuration",
      "Algebra",
      "Ratio and Proportion",
      "Symmetry"
    ],
    physics: [
      "Motion and Measurement of Distances",
      "Light, Shadows and Reflections",
      "Electricity and Circuits",
      "Fun with Magnets",
      "Air Around Us & Physical Atmosphere"
    ]
  },
  7: {
    math: [
      "Integers",
      "Fractions and Decimals",
      "Data Handling",
      "Simple Equations",
      "Lines and Angles",
      "The Triangle and its Properties",
      "Comparing Quantities",
      "Rational Numbers",
      "Perimeter and Area",
      "Algebraic Expressions",
      "Exponents and Powers"
    ],
    physics: [
      "Heat and Temperature",
      "Motion and Time",
      "Electric Current and its Effects",
      "Light (Reflection, Mirrors and Lenses)",
      "Wind, Storms and Atmospheric Energy"
    ]
  },
  8: {
    math: [
      "Rational Numbers",
      "Linear Equations in One Variable",
      "Understanding Quadrilaterals",
      "Data Handling",
      "Squares and Square Roots",
      "Cubes and Cube Roots",
      "Comparing Quantities",
      "Algebraic Expressions and Identities",
      "Mensuration",
      "Exponents and Powers",
      "Direct and Inverse Proportions",
      "Factorisation"
    ],
    physics: [
      "Force and Pressure",
      "Friction",
      "Sound (Vibration, Frequency & Pitch)",
      "Chemical Effects of Electric Current",
      "Some Natural Phenomena (Lightning & Charges)",
      "Light (Reflection & Refraction)"
    ]
  },
  9: {
    math: [
      "Number Systems",
      "Polynomials",
      "Coordinate Geometry",
      "Linear Equations in Two Variables",
      "Introduction to Euclid's Geometry",
      "Lines and Angles",
      "Triangles",
      "Quadrilaterals",
      "Circles",
      "Heron's Formula",
      "Surface Areas and Volumes",
      "Statistics"
    ],
    physics: [
      "Motion (Distance, Velocity, Acceleration, Graphical Analysis)",
      "Force and Laws of Motion (Newton's 3 Laws & Momentum)",
      "Gravitation (Universal Constant, Free Fall, Mass vs Weight)",
      "Work and Energy (Kinetic, Potential, Conservation)",
      "Sound (Wavelength, Frequency, Echo)"
    ]
  },
  10: {
    math: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions (AP)",
      "Triangles",
      "Coordinate Geometry",
      "Introduction to Trigonometry",
      "Some Applications of Trigonometry",
      "Circles",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics & Probability"
    ],
    physics: [
      "Light: Reflection and Refraction",
      "The Human Eye and Colourful World",
      "Electricity",
      "Magnetic Effects of Electric Current"
    ]
  }
};

// Detailed chapters with topics and weightage for Classes 6-10
export const detailedCurriculum: Record<number, ChapterDetail[]> = {
  10: [
    {
      id: 'g10-m-real-numbers',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 1,
      name: 'Real Numbers',
      boardWeightage: '6 Marks',
      totalExpectedHours: 5,
      keyFormulas: ['HCF(a, b) × LCM(a, b) = a × b', 'p divides a² => p divides a'],
      topics: [
        { id: 't-g10-m1-1', name: 'Fundamental Theorem of Arithmetic & Prime Factorisation' },
        { id: 't-g10-m1-2', name: 'Proof of Irrationality for √2, √3, √5' },
        { id: 't-g10-m1-3', name: 'Terminating vs Non-Terminating Decimal Expansions' }
      ]
    },
    {
      id: 'g10-m-polynomials',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 2,
      name: 'Polynomials',
      boardWeightage: '6 Marks',
      totalExpectedHours: 6,
      keyFormulas: ['Sum of roots α + β = -b/a', 'Product of roots αβ = c/a'],
      topics: [
        { id: 't-g10-m2-1', name: 'Geometrical Meaning of Zeroes of a Polynomial' },
        { id: 't-g10-m2-2', name: 'Relationship Between Zeroes & Coefficients of Quadratics' },
        { id: 't-g10-m2-3', name: 'Forming Quadratic Polynomials from Given Zeroes' }
      ]
    },
    {
      id: 'g10-m-linear-equations',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 3,
      name: 'Pair of Linear Equations in Two Variables',
      boardWeightage: '8 Marks',
      totalExpectedHours: 7,
      keyFormulas: ['Consistent: a₁/a₂ ≠ b₁/b₂', 'Infinite: a₁/a₂ = b₁/b₂ = c₁/c₂', 'Parallel: a₁/a₂ = b₁/b₂ ≠ c₁/c₂'],
      topics: [
        { id: 't-g10-m3-1', name: 'Graphical Method of Solution & Intersecting Lines' },
        { id: 't-g10-m3-2', name: 'Algebraic Elimination & Substitution Techniques' },
        { id: 't-g10-m3-3', name: 'Upstream/Downstream & Speed-Time Word Problems' }
      ]
    },
    {
      id: 'g10-m-quadratic-equations',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 4,
      name: 'Quadratic Equations',
      boardWeightage: '8 Marks',
      totalExpectedHours: 8,
      keyFormulas: ['x = (-b ± √(b² - 4ac)) / (2a)', 'Discriminant D = b² - 4ac'],
      topics: [
        { id: 't-g10-m4-1', name: 'Standard Form ax² + bx + c = 0 & Factorisation' },
        { id: 't-g10-m4-2', name: 'Derivation of Quadratic Formula (Completing Square)' },
        { id: 't-g10-m4-3', name: 'Nature of Roots via Discriminant D (D > 0, D = 0, D < 0)' },
        { id: 't-g10-m4-4', name: 'NCERT Exemplar Age, Speed & Geometry Problems' }
      ]
    },
    {
      id: 'g10-m-ap',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 5,
      name: 'Arithmetic Progressions (AP)',
      boardWeightage: '6 Marks',
      totalExpectedHours: 6,
      keyFormulas: ['aₙ = a + (n - 1)d', 'Sₙ = (n/2)[2a + (n - 1)d] = (n/2)(a + l)'],
      topics: [
        { id: 't-g10-m5-1', name: 'Identifying APs, Common Difference d & General Term' },
        { id: 't-g10-m5-2', name: 'Finding nth Term aₙ & Term from the End' },
        { id: 't-g10-m5-3', name: 'Sum of First n Terms & Real-world Daily Savings Applications' }
      ]
    },
    {
      id: 'g10-m-triangles',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 6,
      name: 'Triangles',
      boardWeightage: '9 Marks',
      totalExpectedHours: 9,
      keyFormulas: ['Thales / BPT: AD/DB = AE/EC', 'Criteria: AAA, SSS, SAS Similarity'],
      topics: [
        { id: 't-g10-m6-1', name: 'Basic Proportionality Theorem (Thales) & Its Converse' },
        { id: 't-g10-m6-2', name: 'Criteria for Similarity of Triangles (AAA, SSS, SAS)' },
        { id: 't-g10-m6-3', name: 'Step-by-step NCERT Board Proof Derivations' }
      ]
    },
    {
      id: 'g10-m-coordinate-geom',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 7,
      name: 'Coordinate Geometry',
      boardWeightage: '6 Marks',
      totalExpectedHours: 5,
      keyFormulas: ['d = √[(x₂ - x₁)² + (y₂ - y₁)²]', 'Section: ((m₁x₂ + m₂x₁)/(m₁+m₂), (m₁y₂ + m₂y₁)/(m₁+m₂))'],
      topics: [
        { id: 't-g10-m7-1', name: 'Distance Formula & Collinearity of Three Points' },
        { id: 't-g10-m7-2', name: 'Section Formula (Internal Division & Mid-point)' },
        { id: 't-g10-m7-3', name: 'Types of Quadrilaterals via Coordinate Distance' }
      ]
    },
    {
      id: 'g10-m-trigonometry',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 8,
      name: 'Introduction to Trigonometry',
      boardWeightage: '8 Marks',
      totalExpectedHours: 8,
      keyFormulas: ['sin²θ + cos²θ = 1', '1 + tan²θ = sec²θ', '1 + cot²θ = cosec²θ'],
      topics: [
        { id: 't-g10-m8-1', name: 'Trigonometric Ratios in Right-angled Triangle' },
        { id: 't-g10-m8-2', name: 'Standard Values Table (0°, 30°, 45°, 60°, 90°)' },
        { id: 't-g10-m8-3', name: 'Proving Standard Trigonometric Identities' }
      ]
    },
    {
      id: 'g10-m-trig-applications',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 9,
      name: 'Some Applications of Trigonometry',
      boardWeightage: '5 Marks',
      totalExpectedHours: 5,
      keyFormulas: ['tan θ = Opposite / Adjacent', 'Angle of Elevation = Angle of Depression'],
      topics: [
        { id: 't-g10-m9-1', name: 'Heights and Distances & Line of Sight' },
        { id: 't-g10-m9-2', name: 'Angle of Elevation and Depression' },
        { id: 't-g10-m9-3', name: 'Multi-step Tower, Lighthouse & Balloon Problems' }
      ]
    },
    {
      id: 'g10-m-circles',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 10,
      name: 'Circles',
      boardWeightage: '6 Marks',
      totalExpectedHours: 5,
      keyFormulas: ['Tangent ⊥ Radius at point of contact', 'Lengths of tangents from external point are equal'],
      topics: [
        { id: 't-g10-m10-1', name: 'Tangent to a Circle & Radius Perpendicularity' },
        { id: 't-g10-m10-2', name: 'Length of External Tangents Theorem & Proof' },
        { id: 't-g10-m10-3', name: 'Circumscribing Quadrilateral Board Exemplars' }
      ]
    },
    {
      id: 'g10-m-areas-circles',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 11,
      name: 'Areas Related to Circles',
      boardWeightage: '4 Marks',
      totalExpectedHours: 4,
      keyFormulas: ['Sector Area = (θ/360) × πr²', 'Arc Length = (θ/360) × 2πr'],
      topics: [
        { id: 't-g10-m11-1', name: 'Perimeter and Area of a Circle Review' },
        { id: 't-g10-m11-2', name: 'Areas of Sector and Segment of a Circle' }
      ]
    },
    {
      id: 'g10-m-surface-areas',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 12,
      name: 'Surface Areas and Volumes',
      boardWeightage: '6 Marks',
      totalExpectedHours: 6,
      keyFormulas: ['Cylinder: 2πrh, πr²h', 'Cone: πrl, (1/3)πr²h', 'Sphere: 4πr², (4/3)πr³'],
      topics: [
        { id: 't-g10-m12-1', name: 'Surface Area of Combination of Solids' },
        { id: 't-g10-m12-2', name: 'Volume of Combination of Solids (Cylinder, Cone, Hemisphere)' }
      ]
    },
    {
      id: 'g10-m-statistics-prob',
      grade: 10,
      subject: 'Mathematics',
      chapterNumber: 13,
      name: 'Statistics & Probability',
      boardWeightage: '8 Marks',
      totalExpectedHours: 7,
      keyFormulas: ['Mean = Σ(fᵢxᵢ) / Σfᵢ', 'Mode = l + [(f₁ - f₀)/(2f₁ - f₀ - f₂)]h', 'P(E) = n(E) / n(S)'],
      topics: [
        { id: 't-g10-m13-1', name: 'Mean of Grouped Data (Direct & Assumed Mean)' },
        { id: 't-g10-m13-2', name: 'Median and Modal Class Determination' },
        { id: 't-g10-m13-3', name: 'Classical Probability & Card/Dice Events' }
      ]
    },
    // Class 10 Physics
    {
      id: 'g10-p-light',
      grade: 10,
      subject: 'Physics',
      chapterNumber: 1,
      name: 'Light: Reflection and Refraction',
      boardWeightage: '10 Marks',
      totalExpectedHours: 9,
      keyFormulas: ['Mirror Formula: 1/f = 1/v + 1/u', 'Lens Formula: 1/f = 1/v - 1/u', 'Snell\'s Law: sin i / sin r = n₂₁', 'Power P = 1/f(m)'],
      topics: [
        { id: 't-g10-p1-1', name: 'Reflection by Spherical Mirrors & Ray Diagrams' },
        { id: 't-g10-p1-2', name: 'Mirror Formula & Magnification Calculations' },
        { id: 't-g10-p1-3', name: 'Refraction & Snell\'s Law through Glass Slab' },
        { id: 't-g10-p1-4', name: 'Lens Formula, Power of Lens & Focal Sign Convention' }
      ]
    },
    {
      id: 'g10-p-human-eye',
      grade: 10,
      subject: 'Physics',
      chapterNumber: 2,
      name: 'The Human Eye and Colourful World',
      boardWeightage: '5 Marks',
      totalExpectedHours: 5,
      keyFormulas: ['Power of accommodation', 'Dispersion of white light through prism'],
      topics: [
        { id: 't-g10-p2-1', name: 'Structure of Human Eye & Power of Accommodation' },
        { id: 't-g10-p2-2', name: 'Defects of Vision: Myopia, Hypermetropia & Correction' },
        { id: 't-g10-p2-3', name: 'Refraction through Glass Prism & Dispersion' },
        { id: 't-g10-p2-4', name: 'Atmospheric Refraction (Twinkling of Stars) & Tyndall Effect' }
      ]
    },
    {
      id: 'g10-p-electricity',
      grade: 10,
      subject: 'Physics',
      chapterNumber: 3,
      name: 'Electricity',
      boardWeightage: '9 Marks',
      totalExpectedHours: 8,
      keyFormulas: ['V = IR (Ohm\'s Law)', 'R = ρ(l/A)', 'Series: Rₛ = R₁ + R₂', 'Parallel: 1/Rₚ = 1/R₁ + 1/R₂', 'Joule\'s Heating: H = I²Rt', 'Power: P = VI = I²R = V²/R'],
      topics: [
        { id: 't-g10-p3-1', name: 'Electric Current, Potential Difference & Circuit Diagrams' },
        { id: 't-g10-p3-2', name: 'Ohm\'s Law, Resistance & Factors Affecting Resistivity' },
        { id: 't-g10-p3-3', name: 'Resistors in Series vs Parallel Circuit Analysis' },
        { id: 't-g10-p3-4', name: 'Heating Effect of Current & Electric Power Calculations' }
      ]
    },
    {
      id: 'g10-p-magnetic-effects',
      grade: 10,
      subject: 'Physics',
      chapterNumber: 4,
      name: 'Magnetic Effects of Electric Current',
      boardWeightage: '6 Marks',
      totalExpectedHours: 6,
      keyFormulas: ['Right-Hand Thumb Rule', 'Fleming\'s Left-Hand Rule (Force on Conductor)'],
      topics: [
        { id: 't-g10-p4-1', name: 'Magnetic Field & Field Lines Around Bar Magnet' },
        { id: 't-g10-p4-2', name: 'Field due to Straight Wire, Circular Loop & Solenoid' },
        { id: 't-g10-p4-3', name: 'Force on Current-Carrying Conductor & Fleming\'s Left-Hand Rule' },
        { id: 't-g10-p4-4', name: 'Domestic Electric Circuits, Earthing & Fuse Safety' }
      ]
    }
  ],
  9: [
    {
      id: 'g9-m-number-systems',
      grade: 9,
      subject: 'Mathematics',
      chapterNumber: 1,
      name: 'Number Systems',
      boardWeightage: '8 Marks',
      totalExpectedHours: 6,
      topics: [
        { id: 't-g9-m1-1', name: 'Irrational Numbers on Real Number Line' },
        { id: 't-g9-m1-2', name: 'Rationalisation of Denominators' },
        { id: 't-g9-m1-3', name: 'Laws of Exponents for Real Numbers' }
      ]
    },
    {
      id: 'g9-m-polynomials',
      grade: 9,
      subject: 'Mathematics',
      chapterNumber: 2,
      name: 'Polynomials',
      boardWeightage: '10 Marks',
      totalExpectedHours: 7,
      topics: [
        { id: 't-g9-m2-1', name: 'Zeroes of a Polynomial' },
        { id: 't-g9-m2-2', name: 'Factor Theorem & Splitting Middle Term' },
        { id: 't-g9-m2-3', name: 'Algebraic Identities (x+y+z)², (x±y)³' }
      ]
    },
    {
      id: 'g9-p-motion',
      grade: 9,
      subject: 'Physics',
      chapterNumber: 1,
      name: 'Motion',
      boardWeightage: '9 Marks',
      totalExpectedHours: 8,
      keyFormulas: ['v = u + at', 's = ut + (1/2)at²', 'v² = u² + 2as'],
      topics: [
        { id: 't-g9-p1-1', name: 'Distance, Displacement, Speed & Velocity' },
        { id: 't-g9-p1-2', name: 'Acceleration & Velocity-Time Graphs' },
        { id: 't-g9-p1-3', name: 'Derivation of 3 Equations of Motion by Graphical Method' }
      ]
    },
    {
      id: 'g9-p-force-laws',
      grade: 9,
      subject: 'Physics',
      chapterNumber: 2,
      name: 'Force and Laws of Motion',
      boardWeightage: '8 Marks',
      totalExpectedHours: 7,
      keyFormulas: ['F = ma', 'Momentum p = mv', 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂'],
      topics: [
        { id: 't-g9-p2-1', name: 'Newton\'s First Law & Inertia' },
        { id: 't-g9-p2-2', name: 'Newton\'s Second Law F = ma & Momentum' },
        { id: 't-g9-p2-3', name: 'Newton\'s Third Law & Conservation of Momentum' }
      ]
    }
  ],
  8: [
    {
      id: 'g8-m-rational-numbers',
      grade: 8,
      subject: 'Mathematics',
      chapterNumber: 1,
      name: 'Rational Numbers',
      boardWeightage: '8 Marks',
      totalExpectedHours: 5,
      topics: [
        { id: 't-g8-m1-1', name: 'Properties of Rational Numbers' },
        { id: 't-g8-m1-2', name: 'Representation on the Number Line' }
      ]
    },
    {
      id: 'g8-p-force-pressure',
      grade: 8,
      subject: 'Physics',
      chapterNumber: 1,
      name: 'Force and Pressure',
      boardWeightage: '8 Marks',
      totalExpectedHours: 6,
      topics: [
        { id: 't-g8-p1-1', name: 'Contact and Non-contact Forces' },
        { id: 't-g8-p1-2', name: 'Pressure = Force / Area & Atmospheric Pressure' }
      ]
    }
  ],
  7: [
    {
      id: 'g7-m-integers',
      grade: 7,
      subject: 'Mathematics',
      chapterNumber: 1,
      name: 'Integers',
      boardWeightage: '8 Marks',
      totalExpectedHours: 5,
      topics: [
        { id: 't-g7-m1-1', name: 'Multiplication & Division of Integers' },
        { id: 't-g7-m1-2', name: 'BODMAS Rule with Negative Signs' }
      ]
    },
    {
      id: 'g7-p-heat',
      grade: 7,
      subject: 'Physics',
      chapterNumber: 1,
      name: 'Heat and Temperature',
      boardWeightage: '8 Marks',
      totalExpectedHours: 5,
      topics: [
        { id: 't-g7-p1-1', name: 'Conduction, Convection and Radiation' },
        { id: 't-g7-p1-2', name: 'Clinical and Laboratory Thermometers' }
      ]
    }
  ],
  6: [
    {
      id: 'g6-m-numbers',
      grade: 6,
      subject: 'Mathematics',
      chapterNumber: 1,
      name: 'Knowing Our Numbers',
      boardWeightage: '8 Marks',
      totalExpectedHours: 5,
      topics: [
        { id: 't-g6-m1-1', name: 'Indian and International Place Value Systems' },
        { id: 't-g6-m1-2', name: 'Estimation and Roman Numerals' }
      ]
    },
    {
      id: 'g6-p-motion-distances',
      grade: 6,
      subject: 'Physics',
      chapterNumber: 1,
      name: 'Motion and Measurement of Distances',
      boardWeightage: '8 Marks',
      totalExpectedHours: 5,
      topics: [
        { id: 't-g6-p1-1', name: 'Standard Units of Measurement (SI Units)' },
        { id: 't-g6-p1-2', name: 'Types of Motion (Rectilinear, Circular, Periodic)' }
      ]
    }
  ]
};

// Helper: Normalize string for fuzzy matching
function norm(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Maps a lecture recording to a chapter
 */
export function matchRecordingToChapter(recTitle: string, chapters: ChapterDetail[]): ChapterDetail | undefined {
  const normTitle = norm(recTitle);
  return chapters.find((ch) => {
    const normCh = norm(ch.name);
    // Direct inclusion
    if (normTitle.includes(normCh) || normCh.includes(normTitle)) return true;
    // Check keywords
    const keywords = ch.name.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !['with', 'from', 'into', 'and'].includes(w));
    const matchedCount = keywords.filter(kw => normTitle.includes(norm(kw))).length;
    return matchedCount >= Math.min(2, keywords.length);
  });
}

/**
 * Maps a quiz to a chapter
 */
export function matchQuizToChapter(quizTitle: string, chapters: ChapterDetail[]): ChapterDetail | undefined {
  const normTitle = norm(quizTitle);
  return chapters.find((ch) => {
    const normCh = norm(ch.name);
    if (normTitle.includes(normCh) || normCh.includes(normTitle)) return true;
    const keywords = ch.name.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !['with', 'from', 'into', 'and'].includes(w));
    const matchedCount = keywords.filter(kw => normTitle.includes(norm(kw))).length;
    return matchedCount >= Math.min(2, keywords.length);
  });
}
