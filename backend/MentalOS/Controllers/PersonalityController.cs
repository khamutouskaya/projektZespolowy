using MentalOS.DTOs;
using MentalOS.Services.Interfaces;
using MentalOS.Services;
using Microsoft.AspNetCore.Mvc;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/personality")]
    public class PersonalityController : ControllerBase
    {
        private readonly PersonalityService _service;
        private readonly IQuestionProvider _provider;

        public PersonalityController(
            PersonalityService service,
            IQuestionProvider provider)
        {
            _service = service;
            _provider = provider;
        }

        [HttpGet("questions")]
        public IActionResult GetQuestions()
        {
            return Ok(_provider.GetQuestions());
        }

        [HttpPost("submit")]
        public IActionResult Submit(SubmitTestDto dto)
        {
            var result = _service.Calculate(dto.Answers);
            return Ok(result);
        }
    }
}
