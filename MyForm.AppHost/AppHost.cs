var builder = DistributedApplication.CreateBuilder(args);


var postgres = builder.AddPostgres("postgres").WithPgAdmin().WithDataVolume(name:"data");

var postgresDb = postgres.AddDatabase("myform");
// !!! When deploying to azure there is a warning because of the data volume

var formApi = builder.AddProject<Projects.MyForm_FormApi>("formapi")
    .WithReference(postgresDb)
    .WaitFor(postgresDb);


builder.AddJavaScriptApp(name: "angular-frontend", appDirectory:"../MyForm.AngularApp", runScriptName:"start" )
    .WithReference(formApi)
    .WaitFor(formApi)
    .WithHttpEndpoint(env:"PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
