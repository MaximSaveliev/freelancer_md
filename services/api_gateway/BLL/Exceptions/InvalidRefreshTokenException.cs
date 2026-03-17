namespace BLL.Exceptions;

public sealed class InvalidRefreshTokenException : Exception
{
    public InvalidRefreshTokenException(string message) : base(message) { }
}
