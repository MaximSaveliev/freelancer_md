namespace BLL.Exceptions;

public sealed class InvalidEmailConfirmationException : Exception
{
    public InvalidEmailConfirmationException(string message) : base(message) { }
}

