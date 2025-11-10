import ProjectModel from "../db/models/project.model";
import { ProjectDto, StatusEnum } from "../dto/project.dto";
import { ErrorMessages } from "../errorHandling/errorMessages/errorMessages";
import HttpException from "../errorHandling/Exceptions/httpException";
import HttpStatusCode from "../errorHandling/statusCodes/httpStatusCodes";
import { ProjectDTO } from "../dto/project.dto";
async function save(project: ProjectDTO) {
  try {
    const ST =  new Date(project?.startTime );
    const today = new Date();
    if(ST <= today){
      project.status = StatusEnum.LIVE;
    }else{
      project.status = StatusEnum.COMING_SOON;
    }
    
    const savedProject = new ProjectModel({
      ...project,
      isDeleted: false,
      createdAt: today
    });

    const saved = await savedProject.save();
    return saved;
  } catch (error: any) {
    throw new HttpException(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
}

async function fetchProjects(tokenName = '', tokenSymbol = ''): Promise<ProjectDto[]> {
  try {
    let projects: any;
    if(tokenName) {
      projects = await ProjectModel.find().where('name').equals(tokenName).sort({createdAt: -1});
    }else if (tokenSymbol) {
      projects = await ProjectModel.find().where('symbol').equals(tokenSymbol).sort({createdAt: -1});
    }else{
      projects = await ProjectModel.find().sort({createdAt: -1})
    }
    if (!projects) {
      throw new HttpException(404, ErrorMessages.NO_RECORD_FOUND);
    }
    return projects;
  } catch (error: any) {
    console.log({ error });
    throw new HttpException(404, error.message);
  }
}

async function countAll(): Promise<any> {
  try {
    const totalProjects = await ProjectModel.count();
    if (!totalProjects) {
      throw new HttpException(404, ErrorMessages.NO_RECORD_FOUND);
    }
    return totalProjects;
  } catch (error) {
    
  }
}

async function approveProject(id: string) {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }

    const project = await ProjectModel.findByIdAndUpdate(id, {
      approved: true,
    });

    if (!project) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

const findOneProject = async (id: string): Promise<ProjectDto> => {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.NO_RECORD_FOUND
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(
      HttpStatusCode.BAD_REQUEST,
      ErrorMessages.NO_RECORD_FOUND
    );
  }
};

async function finalizeProject(id: string) {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }
    const timeNow = new Date();
    const project = await ProjectModel.findByIdAndUpdate(id, {
      endTime: new Date(timeNow.toUTCString()),
      ended: true,
    });

    if (!project) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

async function increaseParticipants(id: string) {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }
    let participants!: any;
    if (isAvailable.participants) {
      participants = await ProjectModel.findByIdAndUpdate(id, {
        participants: +isAvailable.participants + 1,
      });
    }

    if (!participants) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return participants;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

async function setWhiteList(id: string) {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }

    const project = await ProjectModel.findByIdAndUpdate(id, {
      whitelist: true,
    });

    if (!project) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

async function setPublic(id: string) {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }

    const project = await ProjectModel.findByIdAndUpdate(id, {
      whitelist: false,
    });

    if (!project) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

const deleteProject = async (id: string) => {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }

    const project = await ProjectModel.findByIdAndDelete(id);

    if (!project) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
};

async function setBought({ id, bought }: { id: string; bought: any }) {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable: any = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }

    const noOfTimesBought = await ProjectModel.findByIdAndUpdate(id, {
      bought: isAvailable.bought + bought,
    });
    if (!noOfTimesBought) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return noOfTimesBought;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

async function updateStatus (id: string, body: {status: string}) {
  try {
    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    if (!body.status) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "status " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }

    const project = await ProjectModel.findByIdAndUpdate(id, {
      status: body.status,
    });

    if (!project) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

async function updateSocial(id: string, body: {twitter?: string, telegram?: string, website?: string, discord?: string, reddit?: string, facebook?: string, instagram?: string, github?: string}) {
  try {

    const qObj: ProjectDTO | any = {};

    if (!id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    if (!body) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "payload" + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await findOneProject(id);
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }

    const {
      website,
      facebook,
      twitter,
      github,
      telegram,
      instagram,
      discord,
      reddit
    } = body;

    
    if(website) qObj.website = website;
    if(facebook) qObj.facebook = facebook;
    if(twitter) qObj.twitter = twitter;
    if(github) qObj.github = github;
    if(telegram) qObj.telegram = telegram;
    if(instagram) qObj.instagram = instagram;
    if(discord) qObj.discord = discord;
    if(reddit) qObj.reddit = reddit;

    const project = await ProjectModel.findByIdAndUpdate(id, qObj);

    if (!project) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

export default {
  save,
  fetchProjects,
  approveProject,
  findOneProject,
  finalizeProject,
  increaseParticipants,
  setWhiteList,
  setPublic,
  deleteProject,
  setBought,
  updateStatus,
  countAll,
  updateSocial
};
