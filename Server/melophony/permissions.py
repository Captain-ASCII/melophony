
import logging
from rest_framework import permissions
from melophony.models import File


class IsOwnerOfInstance(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner of the object.
        if type(obj) == File:
            tracks = obj.track_set.all()
            for track in tracks:
                if track.user == request.user:
                    return True
            return False
        else:
            return obj.user == request.user


class IsAdminOrReadOnly(permissions.IsAdminUser):
    def has_permission(self, request, view):
        if view.action == 'retrieve':
            return request.user.is_authenticated
        elif view.action in ['create', 'list', 'update', 'partial_update', 'destroy']:
            return request.user.is_authenticated and request.user.is_superuser
        else:
            return False

    def has_object_permission(self, request, view, obj):
        # Deny actions on objects if the user is not authenticated
        return request.user.is_authenticated


class UserPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action in ['create', 'login']:
            return True
        elif view.action == 'list':
            return request.user.is_authenticated and request.user.is_superuser
        elif view.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return request.user.is_authenticated
        else:
            return False

    def has_object_permission(self, request, view, obj):
        # Only allow the user to modify his/her account (or superuser)
        return request.user.is_authenticated and (obj == request.user or request.user.is_superuser)