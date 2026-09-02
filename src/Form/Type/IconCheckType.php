<?php

namespace NandoJans\FormTools\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

final class IconCheckType extends AbstractType
{
    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $controllers = $view->vars['attr']['data-controller'] ?? '';
        $view->vars['attr']['data-controller'] = trim($controllers . ' nando-jans--form-tools--icon-check-type');

        $actions = $view->vars['attr']['data-action'] ?? '';
        $view->vars['attr']['data-action'] = trim($actions . ' change->nando-jans--form-tools--icon-check-type#toggle');

        $classes = $view->vars['attr']['class'] ?? '';
        $view->vars['attr']['class'] = trim($classes . ' btn-check');

        $view->vars['icon'] = $options['icon'];
        $view->vars['target'] = $options['target'];
    }

    public function getParent(): string
    {
        return CheckboxType::class;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'icon' => 'fa-border-none',
            'false_values' => [null, '0'],
        ]);

        $resolver->setRequired('target');
        $resolver->setAllowedTypes('icon', ['string']);
        $resolver->setAllowedTypes('target', ['string']);
    }
}
