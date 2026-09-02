<?php

namespace NandoJans\FormTools\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\Options;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CustomCollectionType extends AbstractType
{
    public function getParent(): ?string
    {
        return CollectionType::class;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'polymorphic' => false,
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'editable_order' => true,
            'position_field' => 'position',
            'add_button_label' => 'Add',
            'empty_message' => 'No items have been added yet.',
            'confirm_delete' => 'Are you sure you want to remove this item?',
            'get_child_options' => fn () => [],
        ]);

        $resolver->setAllowedTypes('polymorphic', 'bool');
        $resolver->setAllowedTypes('editable_order', 'bool');
        $resolver->setAllowedTypes('position_field', ['string', 'null']);
        $resolver->setAllowedTypes('add_button_label', 'string');
        $resolver->setAllowedTypes('empty_message', 'string');
        $resolver->setAllowedTypes('confirm_delete', 'string');
        $resolver->setAllowedTypes('get_child_options', 'callable');
        $resolver->setNormalizer('prototype', static fn(Options $options, bool $prototype): bool => $options['polymorphic'] ? false : $prototype);
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        if (!$options['polymorphic']) {
            return;
        }

        $probe = $builder->create('__polymorphic_probe__', $options['entry_type'], [
            ...$options['entry_options'],
            'auto_initialize' => false,
        ]);
        $entryType = $probe->getType()->getInnerType();
        if (!method_exists($entryType, 'getPolymorphicDataClasses')) {
            throw new \InvalidArgumentException(sprintf('The entry type "%s" must use PolymorphicTypeTrait when "polymorphic" is enabled.', $options['entry_type']));
        }

        $prototypes = [];
        $classByDiscriminator = [];
        foreach ($entryType->getPolymorphicDataClasses() as $class) {
            $data = new $class();
            $discriminator = $this->getDiscriminator($data);
            $classByDiscriminator[$discriminator] = $class;
            $prototypes[$discriminator] = $builder->create('__name__', $options['entry_type'], [
                ...$options['entry_options'],
                'data' => $data,
                'auto_initialize' => false,
            ])->getForm();
        }

        $builder->setAttribute('custom_collection_prototypes', $prototypes);
        $builder->addEventListener(FormEvents::PRE_SUBMIT, static function (FormEvent $event) use ($options, $classByDiscriminator): void {
            if (!is_array($event->getData())) {
                return;
            }
            foreach ($event->getData() as $index => $entryData) {
                if ($event->getForm()->has((string)$index) || !is_array($entryData)) {
                    continue;
                }
                $discriminator = (string)($entryData['type'] ?? '');
                $class = $classByDiscriminator[$discriminator] ?? null;
                if ($class === null) {
                    throw new \InvalidArgumentException(sprintf('Unknown polymorphic collection type "%s".', $discriminator));
                }
                $event->getForm()->add((string)$index, $options['entry_type'], [
                    ...$options['entry_options'],
                    'data' => new $class(),
                ]);
            }
        }, 100);
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        foreach ([
             'editable_order',
             'position_field',
             'add_button_label',
             'empty_message',
             'confirm_delete',
             'polymorphic'
         ] as $option) {
            $view->vars[$option] = $options[$option];
        }
    }

    public function finishView(FormView $view, FormInterface $form, array $options): void
    {
        $getChildOptions = $options['get_child_options'] ?? fn () => [];

        foreach ($view->children as $childView) {
            $this->setCollectionOptions($childView, $getChildOptions);
        }

        if (!$options['polymorphic']) {
            if (($view->vars['prototype'] ?? null) instanceof FormView) {
                $this->setCollectionOptions($view->vars['prototype'], $getChildOptions);
            }

            return;
        }
        $view->vars['prototypes'] = [];
        foreach ($form->getConfig()->getAttribute('custom_collection_prototypes') as $name => $prototype) {
            $prototypeView = $prototype->createView();
            $this->setCollectionOptions($prototypeView, $getChildOptions);
            $this->prefixPrototypeView($prototypeView, $view->vars['full_name'] . '[__name__]', $view->vars['id'] . '___name__');
            $view->vars['prototypes'][$name] = $prototypeView;
        }
    }

    private function setCollectionOptions(FormView $view, callable $getChildOptions): void
    {
        $data = $view->vars['data'] ?? null;
        $collectionOptions = $data !== null ? $getChildOptions($data) : [];

        if (!is_array($collectionOptions)) {
            throw new \UnexpectedValueException('The "get_child_options" callback must return an array.');
        }

        $view->vars['collection_options'] = $collectionOptions;
    }

    private function prefixPrototypeView(FormView $view, string $fullName, string $id): void
    {
        $view->vars['full_name'] = $fullName;
        $view->vars['id'] = $id;
        foreach ($view->children as $name => $child) {
            $this->prefixPrototypeView($child, sprintf('%s[%s]', $fullName, $name), sprintf('%s_%s', $id, $name));
        }
    }

    private function getDiscriminator(object $data): string
    {
        if (!method_exists($data, 'getType')) {
            throw new \InvalidArgumentException(sprintf('Polymorphic class "%s" must provide getType().', $data::class));
        }
        $type = $data->getType();
        if ($type instanceof \BackedEnum) {
            return (string)$type->value;
        }
        if (is_string($type) || is_int($type)) {
            return (string)$type;
        }
        throw new \InvalidArgumentException(sprintf('The getType() result for "%s" must be a backed enum, string, or integer.', $data::class));
    }

    public function getBlockPrefix(): string
    {
        return 'custom_collection';
    }
}
