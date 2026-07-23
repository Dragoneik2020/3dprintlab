import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MoldGeneratorService } from '../services/moldGenerator';

const router = Router();
const upload = multer({
  dest: path.resolve(__dirname, '../../uploads'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.stl', '.obj', '.3mf'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo archivos STL, OBJ o 3MF'));
    }
  },
});

const generator = new MoldGeneratorService();

router.post('/generate/two-part', upload.single('model'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const config = JSON.parse(req.body.config || '{}');
    const jobId = uuidv4();

    const result = await generator.generateTwoPartMold(req.file.path, config);

    res.json({ jobId, status: 'completed', result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate/adaptive', upload.single('model'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const config = JSON.parse(req.body.config || '{}');
    const jobId = uuidv4();

    const result = await generator.generateAdaptiveMold(req.file.path, config);

    res.json({ jobId, status: 'completed', result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate/base', upload.single('model'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const config = JSON.parse(req.body.config || '{}');
    const jobId = uuidv4();

    const result = await generator.generateBaseMold(req.file.path, config);

    res.json({ jobId, status: 'completed', result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate/planter', upload.single('model'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const config = JSON.parse(req.body.config || '{}');
    const jobId = uuidv4();

    const result = await generator.generatePlanterMold(req.file.path, config);

    res.json({ jobId, status: 'completed', result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;