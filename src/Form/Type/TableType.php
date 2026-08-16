<?php

namespace NandoJans\FormTools\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TableType extends AbstractType
{
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'columns' => [
                'id' => [
                    'label' => 'UID',
                    'getter' => 'getId',
                ]
            ],
            'empty_message' => 'No items',
            'add_button' => false,
            'click_url' => '',
            'tr_class' => '',
            'template' => '@NandoJans/templates/form/table_type.html.twig',

        ]);

        $resolver->setRequired([]);
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $collection = $form->getData();

        $columns = $options['columns'];
        $rows = [];
        foreach ($collection as $item) {
            $row = [
                'id' => $item->getId(),
            ];

            foreach ($columns as $field => $col) {
                $getter = $col['getter'];
                if (is_string($getter)) {
                    $row[$field] = $item->$getter();
                } else if (is_callable($getter)) {
                    $row[$field] = $getter($item);
                }
            }
            $rows[] = $row;
        }
        $view->vars['cols'] = array_map(fn($col) => $col['label'], $columns);
        $view->vars['colKeys'] = array_keys($columns);
        $view->vars['rows'] = $rows;
        $view->vars['tr_class'] = $options['tr_class'];
        $view->vars['empty_message'] = $options['empty_message'];
        $view->vars['click_url'] = $options['click_url'];
        $view->vars['add_button'] = $options['add_button'];
        $view->vars['template'] = $options['template'];
    }

    public function getBlockPrefix(): string
    {
        return 'nandojans_table';
    }
}