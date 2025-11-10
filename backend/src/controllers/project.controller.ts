import { NextFunction, Request, Response, Router } from "express";
import { ProjectDto } from "../dto/project.dto";
import { ErrorMessages } from "../errorHandling/errorMessages/errorMessages";
import HttpException from "../errorHandling/Exceptions/httpException";
import HttpStatusCode from "../errorHandling/statusCodes/httpStatusCodes";
import ProjectService from "../services/project.service";
import { AppRoute } from "../app-route"
import { Api } from "../helpers";

export class ProjectController implements AppRoute {

    public route = "/projects";
    public router: Router = Router();
    constructor() { 
        this.router.get("/health", this.health);
        this.router.get("/approve/:id", this.approveProject);
        this.router.get("/", this.fetchAll);
        this.router.get("/:id", this.fetchOne);
        this.router.post("/save", this.save);
        this.router.delete("/:id", this.deleteProject);
        this.router.get("/finalize/:id", this.finalizeProject);
        this.router.get("/increase-participants/:id", this.increaseParticipants);
        this.router.get("/set-whitelist/:id", this.setWhiteList);
        this.router.get("/set-public/:id", this.setPublic);
        this.router.post("/set-bought/:id", this.setBought);
        this.router.patch("/:id", this.updateStatus);
        this.router.patch("/socials/:id", this.updateSocial);
        this.router.get("/token/count", this.countAll);
    }

    async health(req: Request, res: Response,){
        res.status(200).json({data: 'health'})
    }

    async save(req: Request, res: Response, next: NextFunction){
        // const reqq = new ProjectDto(req as any);
        const body = req.body;
        try {
            const project = await ProjectService.save(body);
            if(!project){
                throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorMessages.CREATE_FAILED)
            }
            res.status(201).json({data: project})
            // res.send('successfully saved')
        } catch (error: any) {
            next(error);
            throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, error.message)
        }
    }

    async approveProject(req : Request, res: Response){
        try {
            const id = req.params.id;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const approval = await ProjectService.approveProject(id);
            return Api.ok(req, res, approval);
        } catch (error: any) {
            return Api.serverError(req, res, error.message);
        }
    }

    async fetchAll(req: Request, res: Response){
        try {
            const tokenName = req.params.token_name;
            const tokenSymbol = req.params.token_symbol;
            const project = await ProjectService.fetchProjects(tokenName, tokenSymbol);
            return Api.ok(req, res, project);
        } catch (error: any ){
            console.log({error})
            return Api.notFound(req, res)
        }
    }

    async countAll(req: Request, res: Response){
        try {
            const presale = await ProjectService.countAll();
            return Api.ok(req, res, presale);
        } catch (error) {
            console.log({error})
            return Api.notFound(req, res) 
        }
    }

    async fetchOne(req: Request, res: Response){
        try {
            const id = req.params.id;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            const project = await ProjectService.findOneProject(id);
            return Api.ok(req, res, project);
        } catch (error: any) {
            console.log({error})
            return Api.notFound(req, res)
        }
    }

    async finalizeProject(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const finalized = await ProjectService.finalizeProject(id);
            return Api.ok(req, res, finalized);
        } catch (error: any) {
            next(error)
            return Api.serverError(req, res, error.message);
        }
    }

    async increaseParticipants(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const increasedParticipants = await ProjectService.finalizeProject(id);
            return Api.ok(req, res, increasedParticipants);
        } catch (error: any) {
            next(error)
            return Api.serverError(req, res, error.message);
        }
    }

    async setWhiteList(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const updateWhiteList = await ProjectService.setWhiteList(id);
            return Api.ok(req, res, updateWhiteList);
        } catch (error: any) {
            next(error)
            return Api.serverError(req, res, error.message);
        }
    }

    async setPublic(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const setToPublic = await ProjectService.setPublic(id);
            return Api.ok(req, res, setToPublic);
        } catch (error: any) {
            next(error)
            return Api.serverError(req, res, error.message);
        }
    }

    async deleteProject(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const deleted = await ProjectService.deleteProject(id);
            return Api.ok(req, res, deleted);
        } catch (error: any) {
            next(error)
            return Api.serverError(req, res, error.message);
        }
    }

   async setBought(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id;
            const { bought } = req.body;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            if (!bought) {
              return Api.badRequest(req, res, 'bought: '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const setBought = await ProjectService.setBought({id, bought});
            return Api.ok(req, res, setBought);
        } catch (error: any) {
            next(error)
            return Api.serverError(req, res, error.message);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id;
            const body = req.body;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const updateStatus = await ProjectService.updateStatus(id, body);
            return Api.ok(req, res, updateStatus);
        } catch (error: any) {
            next(error)
            return Api.serverError(req, res, error.message);
        }
    }

    async updateSocial(req: Request, res: Response, next: NextFunction){
        try {
            const id = req.params.id;
            const body = req.body;
            if (!id) {
              return Api.badRequest(req, res, 'id '+ ErrorMessages.CANNOT_BE_EMPTY)
            }
            
            const updateSocial = await ProjectService.updateSocial(id, body);
            return Api.ok(req, res, updateSocial);
        } catch (error: any) {
            next(error)
            return Api.serverError(req, res, error.message);
        }
    }
}

