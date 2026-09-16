<?php

namespace NandoJans\FormTools\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\SubmitButtonTypeInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DeleteType extends AbstractType implements SubmitButtonTypeInterface
{

    public function getParent(): ?string
    {
        return SubmitType::class;
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['path_name'] = $options['path_name'];
        $view->vars['id'] = $options['id'];
        $view->vars['confirm_message'] = $options['confirm_message'];
        $view->vars['icon'] = $options['icon'];
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'path_name' => null,
            'id' => null,
            'confirm_message' => null,
            'icon' => null,
            'label' => null
        ]);

        $resolver->setRequired([
            'path_name',
            'id',
            'confirm_message',
            'label'
        ]);
    }
}