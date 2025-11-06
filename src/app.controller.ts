// app.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from './user/public.decorator';

@Controller()
@Public()
export class AppController {

  @Get()
  landingPage(@Res() res: Response) {


  const globalPrefix = process.env.GLOBAL_PREFIX || 'api/v1';
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>SLA Admin Portal API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #333;
        }

        .container {
          background: white;
          padding: 50px 60px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
          width: 90%;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 15px;
          color: #006273; /* 🔹 Your theme color */
        }

        p {
          font-size: 1.1rem;
          margin-bottom: 30px;
          color: #555;
        }

        .btn-start {
          background: #006273; /* 🔹 Theme button */
          color: #fff;
          padding: 15px 35px;
          font-size: 1.1rem;
          border-radius: 8px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .btn-start:hover {
          background: #004d55; /* Slightly darker hover effect */
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        @media (max-width: 600px) {
          .container { padding: 30px 20px; }
          h1 { font-size: 2rem; }
          p { font-size: 1rem; }
          .btn-start { padding: 12px 25px; font-size: 1rem; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>SLA Admin Portal API</h1>
        <p>Welcome! Click the button below to explore the API documentation.</p>
        <a href="/${globalPrefix}/docs" class="btn-start">Start</a>
      </div>
    </body>
    </html>
    `;
    res.status(200).send(html);
  }
}
