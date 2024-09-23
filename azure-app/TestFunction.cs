using Google.Cloud.PubSub.V1;
using Google.Protobuf;

using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

using System.Net.Http.Json;

using Bogus;

namespace AzureApp
{
    public class TestFunction(ILogger<TestFunction> logger, IConfiguration config)
    {
        private readonly ILogger<TestFunction> _logger = logger;
        private readonly IConfiguration _config = config;

        [Function("PubTopicSdk")]
        public async Task<IActionResult> SdkAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
        {
            _logger.LogInformation("function started");

            // initiate pub/sub
            string projectId = _config.GetValue<string>("GOOGLE_PROJECT_ID");
            string topicId = _config.GetValue<string>("GOOGLE_TOPIC_ID");
            var topicName = TopicName.FromProjectTopic(projectId, topicId);
            var publisherClient = await PublisherClient.CreateAsync(topicName);
            _logger.LogInformation("pub/sub Project: {projectId} Topic: {topicId}", projectId, topicId);

            // pub/sub message
            var faker = new Faker();
            var user = new User { Id = Guid.NewGuid().ToString(), Name = faker.Person.FullName, Email = faker.Person.Email };
            var jsonOptions = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            string message = JsonConvert.SerializeObject(user, jsonOptions);
            var pubsubMessage = new PubsubMessage { Data = ByteString.CopyFromUtf8(message) };
            _logger.LogInformation("pub/sub Message: {pubsubMessage}", pubsubMessage);

            // publish message to pub/sub
            string messageId = await publisherClient.PublishAsync(pubsubMessage);

            return new OkObjectResult($"Published Message with ID: {messageId}!");
        }

        [Function("PubTopicHmac")]
        public async Task<IActionResult> HmacAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
        {
            _logger.LogInformation("function started");

            // HMAC for API authentication
            var tokenSecret = _config.GetValue<string>("TOKEN_SECRET");
            var timestamp = DateTime.Now.Ticks.ToString();
            var hmac = Util.CreateHmacSha256(tokenSecret, timestamp);
            _logger.LogInformation("HMAC: {hmac}", hmac);

            // pub/sub message           
            var faker = new Faker();
            var user = new User { Id = Guid.NewGuid().ToString(), Name = faker.Person.FullName, Email = faker.Person.Email };
            var jsonOptions = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            string message = JsonConvert.SerializeObject(user, jsonOptions);
            _logger.LogInformation("pub/sub Message: {message}", message);

            string topicId = _config.GetValue<string>("GOOGLE_TOPIC_ID");
            var pubsubMessage = new PubSubData { Topic = topicId, Message = message };

            // publish message to pub/sub
            string apiUrl = _config.GetValue<string>("API_URL");
            var _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("x-signature", hmac);
            _httpClient.DefaultRequestHeaders.Add("x-timestamp", timestamp);
            var response = await _httpClient.PostAsJsonAsync(apiUrl, pubsubMessage);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("API call succeeded");

                var messageId = await response.Content.ReadAsStringAsync();
                return new OkObjectResult($"Published message with HMAC: {hmac} and ID: {messageId}!");
            }
            else
            {
                _logger.LogInformation("API call failed: {response.StatusCode}", response.StatusCode);
                return new BadRequestResult();
            }
        }
    }
}
