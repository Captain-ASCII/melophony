from itertools import chain
from django.db.models.fields.related import ForeignKey

# filters is a list of keys to keep in the current object
# foreign_keys is a list of keys associated to foreign objects that should be returned with the current object
# foreign_filters is a dict which keys must match foreign_keys and which values are a list of keys to keep in the foreign object
def model_to_dict(instance, filters=None, foreign_keys=[], foreign_filters={}):
    data = {}
    if instance is not None:
        opts = instance._meta
        for f in chain(opts.concrete_fields, opts.private_fields):
            if filters is None or f.name in filters:
                if isinstance(f, ForeignKey) and f.name in foreign_keys:
                    data[f.name] = model_to_dict(getattr(instance, f.name), foreign_filters[f.name] if f.name in foreign_filters else None, foreign_keys)
                else:
                    data[f.name] = f.value_from_object(instance)
        for f in opts.many_to_many:
            if filters is None or f.name in filters:
                data[f.name] = [model_to_dict(i, foreign_filters[f.name] if f.name in foreign_filters else None, foreign_keys) if f.name in foreign_keys else i.id for i in f.value_from_object(instance)]
    return data