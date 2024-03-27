import { IsString } from 'class-validator';
import { ICourse } from '@purple/interfaces';

export namespace CourseGetCourse {
  export const topic = 'corse.get-course.query';

  export class Request {
    @IsString()
    id: string;

  }

  export class Response {
    course: ICourse | null;
  }
}
