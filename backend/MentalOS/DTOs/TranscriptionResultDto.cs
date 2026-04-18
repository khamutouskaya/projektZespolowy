namespace MentalOS.DTOs
{
    public class TranscriptionResultDto
    {
        public bool Success { get; set; }

        public string Transcript { get; set; } = "";

        public string? Language { get; set; }

        public string? Error { get; set; }

        public string? FileName { get; set; }

        public long FileSize { get; set; }
    }


}
