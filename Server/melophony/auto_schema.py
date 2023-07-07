
from drf_yasg import openapi
from drf_yasg.inspectors import SwaggerAutoSchema


def add_if_required(props, key, value, is_required):
    if is_required:
        props[key] = value


class AutoSchema(SwaggerAutoSchema):
    def get_user_schema(self, in_response=False, is_update=False, is_login=False):
        properties = {}
        add_if_required(properties, 'id', openapi.Schema(type=openapi.TYPE_INTEGER, description='Id of the user object'), in_response)
        add_if_required(properties, 'username', openapi.Schema(type=openapi.TYPE_STRING, description='Username of the user'), True)
        add_if_required(properties, 'password', openapi.Schema(type=openapi.TYPE_STRING, description='Password of the user'), is_update or is_login)
        add_if_required(properties, 'first_name', openapi.Schema(type=openapi.TYPE_STRING, description='First name of the user'), is_update or in_response)
        add_if_required(properties, 'last_name', openapi.Schema(type=openapi.TYPE_STRING, description='Last name of the user'), is_update or in_response)
        add_if_required(properties, 'email', openapi.Schema(type=openapi.TYPE_STRING, description='Email address of the user'), is_update)
        return properties

    def get_request_body_schema(self, serializer):
        if getattr(self.view, 'user_classes', False):
            return openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties=self.get_user_schema(
                    is_update=self.view.action in ['create', 'update', 'partial_update'],
                    is_login=(self.view.action == 'login')
                )
            )
        else:
            return super(AutoSchema, self).get_request_body_schema(serializer)

