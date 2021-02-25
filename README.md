# Loan Management System (Rest-API)
A Rest API which facilitates in managing loans and provide access level and actions for different users.

**Tech stack used**<br/>
  Nodejs, Express framework, Mongodb

**Key modules used**<br>
  Jsonwebtoken, Bcryptjs, Mocha, Chai   

  **A short abstract of the API**
  - Users are classified into three types:- Customer, Agent, Admin<br/>
  - Customer is the client and he can request the agent to apply for a loan <br/>
  - Agent is the middleman associated with the bank who has certain authourities such as edit loans, making loan request in behalf of customer<br/>
    listing users<br/>
  - Admin can only create an agent and he would provide the credentials<br/>
  - Admin is the highest authority who can approve or reject a loan and also the request by agent<br/>
  - Customers can Sign up<br/>
  - Admin, cutomers and agents can login<br/>
  - A loan has entities such as principle, interest rate, months to repay, emi and status and history<br/>
  - The value of interest rate would depend on the value of principle<br/>
  - The loan can have 3 kinds of status: Approved, New or Rejected<br/>
  - If the loan object undergoes some change then the change is updated in history

  **Model Schemas**
  > User<br/>
    Has details about the user such as name, email, password and his loan details<br/>
   >Loan<br/>
    Has details of principle, interest rate, months to repay, emi, status and history of edited loans<br/>

  **key features**
  - customers can alone Signup<br/>
  - While signup customers details will be fed to the database.<br/>
  - Admin can only create an agent account and handover the credentials
      to the agent <br/>
  - During the initialization of the API the admin account will be     created and its details are present in the database<br/>
  - Admin credentials- <br/>
  email: test@gmail.com <br/>
  password: myadminaccess<br/>
  - all the passwords stored are encrypted <br/>
  - agents and admin can view all the users <br/>
  - The interest rate is decided upon a principle amount<br/>
  - Admin can only change the status of the loan<br/>
  - Agents can edit the loan details excluding status and this can be done if the loan is not having the status approved<br/>
  - If Any changes made in the loan, The change alone along with the timestamp is pushed inside<br/>
  - admin and agents have the facility to filter the loan details<br/>

  **Routes present in the API**

  > /user/userRegister<br />
  > /user/agentRegister<br />
  > /auth<br />
  > /user/users<br />
  > /user/users/:userId   -get<br />
  > /user/users/:userId   -patch <br />
  > /loan/createLoan<br />
  > /loan/loans <br />
  > /loan/:loanId <br />
  > /loan/filter <br />
  > /loan/editLoan/:loanId <br />


  **Set up Project using Docker files**

  - For testing<br/>
  - Run these two commands<br/>
  - docker-compose build<br/>
  - docker-compose up <br/><br/>
  - For Production
  - go to Dockerfile and uncomment (#CMD ["npm", "start"]) this line by just removing the hash ,after that comment this(#CMD ["npm", "test"]).
  - docker-compose build<br/>
  - docker-compose up <br/><br/>


  **If there issues with docker**
  > Run "npm init", setup the project install the dependencies and run "npm start"
  <br/>

  **Run unit tests on Node**

  - Install the dev dependencies: mocha, chai and chai http<br/>
  - Navigate to project directory and run => "npm test"
