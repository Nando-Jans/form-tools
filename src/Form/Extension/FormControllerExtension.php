<?php

namespace NandoJans\FormTools\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;

class FormControllerExtension extends AbstractTypeExtension
{

    public static function getExtendedTypes(): iterable
    {
        return [FormType::class];
    }

    public function buildView(
        FormView      $view,
        FormInterface $form,
        array         $options
    ): void {
        // Only apply it to the root <form>, not every nested field.
        if ($form->getParent() !== null || !$form->getConfig()->getCompound()) {
            return;
        }

        $view->vars['attr']['data-controller'] = trim(
            ($view->vars['attr']['data-controller'] ?? '') . ' nando-jans--form-tools--form'
        );

        $view->vars['attr']['data-action'] = trim(
            ($view->vars['attr']['data-action'] ?? '') .
            '
             form-tools:form:register@window->nando-jans--form-tools--form#registerFormStateEvent
             form-tools:form:undo@window->nando-jans--form-tools--form#undo
             form-tools:form:redo@window->nando-jans--form-tools--form#redo
            '
        );
    }
}