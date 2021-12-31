from itertools import chain
from django.db.models.fields.related import ForeignKey


def model_to_dict(instance, recursive=False):
    data = {}
    if instance is not None:
        opts = instance._meta
        for f in chain(opts.concrete_fields, opts.private_fields):
            if isinstance(f, ForeignKey) and recursive:
                data[f.name] = model_to_dict(getattr(instance, f.name))
            else:
                data[f.name] = f.value_from_object(instance)
        for f in opts.many_to_many:
            data[f.name] = [model_to_dict(i) if recursive else i.id for i in f.value_from_object(instance)]
    return data