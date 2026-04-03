from modeltranslation.translator import translator, TranslationOptions
from dpms.compos.models import Compo, Edition


class CompoTranslationOptions(TranslationOptions):
    fields = ('description', 'rules')


class EditionTranslationOptions(TranslationOptions):
    fields = ('description', 'contact_info', 'travel_info')


translator.register(Compo, CompoTranslationOptions)
translator.register(Edition, EditionTranslationOptions)
