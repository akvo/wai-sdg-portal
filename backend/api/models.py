from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import int_list_validator
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField


class Administration(models.Model):
    class Level(models.TextChoices):
        WOREDA = 'WOREDA', _('Woreda')
        KEBELE = 'KEBELE', _('Kebele')

    parent_id = models.ForeignKey('self', models.DO_NOTHING)
    name = models.CharField(max_length=30)
    level = models.CharField(choices=Level.choices, max_length=6, default=Level.WOREDA)
    users = models.ManyToManyField(User)


class Form(models.Model):
    name = models.CharField(max_length=100)


class QuestionGroup(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    text = models.TextField()


class Question(models.Model):

    class QuestionType(models.TextChoices):
        GEO = 'GEO', _('Geo')
        FREE = 'FREE', _('Free')
        NUMERIC = 'NUMERIC', _('Numeric')
        OPTION = 'OPTION', _('Option')
        PHOTO = 'PHOTO', _('Photo')
        DATE = 'DATE', _('Date')

    question_group = models.ForeignKey(QuestionGroup, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    display_name = models.BooleanField()
    text = models.TextField()
    type = models.CharField(
                choices=QuestionType.choices,
                max_length=8,
                default=QuestionType.FREE
           )


class Option(models.Model):

    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    text = models.TextField()


class Data(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    display_name = models.TextField()
    position = models.CharField(validators=[int_list_validator], max_length=30)
    administration = models.ForeignKey(Administration, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User,
            related_name='user_data_created', on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User,
            related_name='user_data_updated', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Answer(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    data = models.ForeignKey(Data, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text = models.TextField(default=None)
    value = models.FloatField(default=None)
    options = ArrayField(models.IntegerField(),null=True, blank=True)
    created_by = models.ForeignKey(User,
            related_name='user_answer_created', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AnswerHistory(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    data = models.ForeignKey(Data, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text = models.TextField(default=None)
    value = models.FloatField(default=None)
    options = ArrayField(models.IntegerField(),null=True, blank=True)
    created_by = models.ForeignKey(User,
            related_name='user_history_created', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
