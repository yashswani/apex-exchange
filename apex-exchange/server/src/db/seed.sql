INSERT INTO commodities (symbol, name, current_price) VALUES ('QFUEL', 'Quantum Fuel', 120.00) ON CONFLICT (symbol) DO NOTHING;
INSERT INTO commodities (symbol, name, current_price) VALUES ('DMO',   'Dark Matter Ore', 450.00) ON CONFLICT (symbol) DO NOTHING;
INSERT INTO commodities (symbol, name, current_price) VALUES ('BIOS',  'Bio-Synthetics', 75.00)  ON CONFLICT (symbol) DO NOTHING;
INSERT INTO commodities (symbol, name, current_price) VALUES ('TGRN',  'Terran Grains',  18.00)  ON CONFLICT (symbol) DO NOTHING;
