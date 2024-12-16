import { Request, Response, NextFunction } from 'express';

const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!(req.session as any).user)  {
    return res.redirect('/login');
  }
  res.locals.user = (req.session as any).user;
  next();
};

export default authenticationMiddleware;
