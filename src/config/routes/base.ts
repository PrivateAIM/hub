import { Router } from 'express';
let router = Router();

import {forceLoggedIn} from "../../services/router/middleware/authMiddleware";
import UserController from "../../controllers/user/UserController";

router.get('/me', [forceLoggedIn], UserController.getMe);
router.get('/',(req: any, res: any) => {
    let d = new Date();

    console.log(d.getHours());
    return res._respond({
        data: {
            version: '1.0'
        }
    })
    //return res._failNotFound();
});

export default router;
