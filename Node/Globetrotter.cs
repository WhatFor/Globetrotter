using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;

namespace Node
{
    public static class Globetrotter
    {
        [FunctionName("Globetrotter")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            [SignalR(HubName = "hops")]IAsyncCollector<SignalRMessage> signalRMessages,
            ILogger log)
        {
            var nextAddr = Environment.GetEnvironmentVariable("NextNodeAddress");
            var selfIdentifier = Environment.GetEnvironmentVariable("SelfIdentifier");
            
            var hopCount = req.Query.ContainsKey("hop_count") ? int.Parse(req.Query["hop_count"].FirstOrDefault() ?? "0") : 0;
            
            var maxHopCount = Environment.GetEnvironmentVariable("MaxHopCount");
            var maxHopCountInt = maxHopCount != null ? int.Parse(maxHopCount) : 10;
            
            var delayMs = Environment.GetEnvironmentVariable("DelayMs");
            var delayMsInt = delayMs != null ? int.Parse(delayMs) : 2000;
            
            log.LogInformation($"Beginning execution of {nameof(Globetrotter)}. Node '{selfIdentifier}'.");

            using var httpClient = new HttpClient();
            
            // Report to host
            log.LogInformation($"Calling host from node '{selfIdentifier}'...");
            
            await signalRMessages.AddAsync(
                new SignalRMessage
                {
                    Target = "newMessage",
                    Arguments = new [] {
                        new
                        {
                            Node = selfIdentifier,
                            Time = DateTime.UtcNow,
                        }
                    }
                });
            
            log.LogInformation($"Called host from node '{selfIdentifier}'.");
            
            if (hopCount > maxHopCountInt)
            {
                log.LogInformation($"Stopping execution of {nameof(Globetrotter)}. Node '{selfIdentifier}'. Hit max hop count.");
                return new OkResult();
            }
            
            // Hop to next node
            if (nextAddr?.FirstOrDefault() != null)
            {
                log.LogInformation($"Calling next node '{nextAddr}' from node '{selfIdentifier}'...");

                await Task.Delay(delayMsInt);
                await httpClient.GetAsync(nextAddr + "?hop_count=" + (hopCount + 1));
                
                log.LogInformation($"Called next node '{nextAddr}' from node '{selfIdentifier}'.");
            }
            
            log.LogInformation($"Completed execution of {nameof(Globetrotter)}");

            return new OkResult();
        }
    }
}
