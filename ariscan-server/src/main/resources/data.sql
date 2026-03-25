INSERT IGNORE INTO treatments (disease_name, crop_type, organic_remedy, chemical_pesticide, pesticide_dosage, preventive_measures) VALUES

('Early Blight', 'Tomato', 
 'Neem oil spray (5ml per litre of water), remove infected leaves immediately', 
 'Mancozeb 75% WP', '2g per litre of water, spray every 7 days',
 'Avoid overhead watering, maintain plant spacing, rotate crops yearly'),

('Late Blight', 'Tomato',
 'Copper-based fungicide spray, remove and destroy infected plant parts',
 'Metalaxyl + Mancozeb', '2.5g per litre, spray at first sign',
 'Use certified disease-free seeds, avoid wet foliage, grow resistant varieties'),

('Leaf Spot', 'Tomato',
 'Baking soda solution (1 tsp per litre), garlic spray',
 'Chlorothalonil 75% WP', '2g per litre every 10 days',
 'Improve air circulation, water at base of plant, remove dead leaves'),

('Powdery Mildew', 'Wheat',
 'Milk spray (40% milk + 60% water), sulfur dust',
 'Propiconazole 25% EC', '1ml per litre, apply at early stage',
 'Plant resistant varieties, avoid excess nitrogen fertilizer'),

('Brown Rust', 'Wheat',
 'Remove and burn infected plant material early',
 'Tebuconazole 25.9% EC', '1ml per litre, spray at flag leaf stage',
 'Use rust-resistant wheat varieties, early sowing'),

('Blast', 'Rice',
 'Silicon-rich soil amendments, remove infected tillers',
 'Tricyclazole 75% WP', '0.6g per litre, spray at tillering stage',
 'Avoid excess nitrogen, maintain proper water level, use blast-resistant varieties'),

('Brown Plant Hopper', 'Rice',
 'Neem seed kernel extract, release natural predators',
 'Imidacloprid 17.8% SL', '0.25ml per litre',
 'Avoid excess nitrogenous fertilizers, maintain field hygiene'),

('Downy Mildew', 'Corn',
 'Remove infected plants immediately, improve drainage',
 'Metalaxyl 8% + Mancozeb 64% WP', '2.5g per litre',
 'Use treated seeds, avoid waterlogging, crop rotation'),

('Northern Leaf Blight', 'Corn',
 'Crop residue management, compost application',
 'Propiconazole 25% EC', '1ml per litre at silking stage',
 'Plant resistant hybrids, timely sowing, avoid dense planting'),

('Healthy', NULL,
 'Continue current care routine',
 'No treatment needed', 'N/A',
 'Maintain proper watering, fertilization, and crop rotation');