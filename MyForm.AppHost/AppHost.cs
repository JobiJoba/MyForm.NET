var builder = DistributedApplication.CreateBuilder(args);

var formApi = builder.AddProject<Projects.MyForm_FormApi>("formapi");


builder.AddJavaScriptApp(name: "angular-frontend", appDirectory:"../MyForm.AngularApp", runScriptName:"start" )
    .WithReference(formApi)
    .WaitFor(formApi)
    .WithHttpEndpoint(env:"PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
