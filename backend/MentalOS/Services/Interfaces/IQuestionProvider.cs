using MentalOS.Domain;

namespace MentalOS.Services.Interfaces
{
    public interface IQuestionProvider
    {
        List<PersonalityQuestion> GetQuestions();
    }
}
