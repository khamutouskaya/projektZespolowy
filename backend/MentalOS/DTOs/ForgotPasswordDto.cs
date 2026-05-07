using System.ComponentModel.DataAnnotations;

namespace MentalOS.DTOs
{
    public sealed class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
    public sealed class ResetPasswordDto
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }
}
