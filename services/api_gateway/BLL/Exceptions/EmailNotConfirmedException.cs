namespace BLL.Exceptions;

public sealed class EmailNotConfirmedException : Exception
{
    public EmailNotConfirmedException(string message) : base(message) { }
}

