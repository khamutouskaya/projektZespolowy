
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MentalOS.Services.Interfaces;

namespace MentalOS.Services
{
    public sealed class GmailSmtpEmailService : IEmailService
    {
        public readonly IConfiguration _config;
        public readonly ILogger<GmailSmtpEmailService> _logger;

        public GmailSmtpEmailService(IConfiguration config, ILogger<GmailSmtpEmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken ct = default)
        {
            var host = _config["Smtp:Host"];
            var port = int.Parse(_config["Smtp:Port"]!);
            var user = _config["Smtp:User"];
            var pass = _config["Smtp:Pass"];
            var from = _config["Smtp:From"];

            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(from));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            // HTML body (can be changed to "plain")
            message.Body = new TextPart("html")
            {
                Text = body
            };

            using var client = new SmtpClient();

            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(user, pass, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("Sent email to {ToEmail}", toEmail);
        }
    }
}
