namespace AzureApp
{
    public class User
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }

    public class PubSubData
    {
        public string Topic { get; set; }
        public string Message { get; set; }
    }
}