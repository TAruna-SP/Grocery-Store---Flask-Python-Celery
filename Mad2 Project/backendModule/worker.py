from celery import Celery, Task

def celery_init_app(app):
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celeryStore = Celery(app.name, task_cls=FlaskTask)
    celeryStore.config_from_object("celeryconfig")
    return celeryStore