ALTER TABLE ai_use_cases ADD COLUMN review_note text, ADD COLUMN reviewed_by uuid;
ALTER TABLE risks ADD COLUMN review_note text, ADD COLUMN reviewed_by uuid;
ALTER TABLE evidences ADD COLUMN review_note text, ADD COLUMN reviewed_by uuid;