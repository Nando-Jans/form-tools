<?php

namespace NandoJans\FormTools\Trait;

use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

trait PolymorphicTypeTrait
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        parent::buildForm($builder, $options);

        $builder->addEventListener(
            FormEvents::PRE_SET_DATA,
            function (FormEvent $event): void {
                $task = $event->getData();
                $form = $event->getForm();

                foreach ($this->getTypeToBuilder() as $type => $builder) {
                    if ($task instanceof $type) {
                        $builder($form);
                    }
                }
            },
        );
    }

    /**
     * Define the mapping between task types and their respective form builders.
     * @return array<string, callable(FormBuilderInterface): void>
     */
    protected abstract function getTypeToBuilder(): array;

    /** @return list<class-string> */
    final public function getPolymorphicDataClasses(): array
    {
        return array_keys($this->getTypeToBuilder());
    }
}
