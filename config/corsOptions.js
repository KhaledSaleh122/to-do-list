import {allowedOrigins} from './allowedOrigins.js'

export const corsOptions = {
  origin: (origin,callback)=>{
    if(allwoedOrigins.indexOf(origin) !== -1 || !origin){
      callback(null,true)
    } else{
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus:200
}

