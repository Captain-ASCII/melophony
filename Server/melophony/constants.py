
class Status:
    SUCCESS = 200
    CREATED = 201
    NO_CONTENT = 204
    BAD_REQUEST = 400
    UNAUTHORIZED = 403
    NOT_FOUND = 404
    ERROR = 500


class Message:
    SUCCESS = "Success"
    CREATED = "Created"
    ERROR = "Error"
    UNAUTHORIZED = "Not authorized to perform this operation."
    NOT_FOUND = "Not found."


STATUS_TO_MESSAGE = {
    Status.SUCCESS: Message.SUCCESS,
    Status.CREATED: Message.CREATED,
    Status.NO_CONTENT: Message.SUCCESS,
    Status.NOT_FOUND: Message.NOT_FOUND,
    Status.BAD_REQUEST: Message.ERROR,
    Status.UNAUTHORIZED: Message.UNAUTHORIZED,
    Status.ERROR: Message.ERROR,
}


def get_associated_message(code):
    return STATUS_TO_MESSAGE.get(code, Message.ERROR)