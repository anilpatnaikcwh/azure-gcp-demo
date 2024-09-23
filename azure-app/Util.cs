using System.Security.Cryptography;

namespace AzureApp
{
    public class Util
    {
        public static string CreateHmacSha256(string tokenSecret, string message)
        {
            byte[] secret = System.Text.Encoding.UTF8.GetBytes(tokenSecret);
            byte[] payload = System.Text.Encoding.UTF8.GetBytes(message);
            using var hmac = new HMACSHA256(secret);
            byte[] hash = hmac.ComputeHash(payload);
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}