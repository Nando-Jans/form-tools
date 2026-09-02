<?php

namespace NandoJans\FormTools\Service;

use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final readonly class FormAutosaveHandler
{
    public function __construct(private FormFactoryInterface $formFactory)
    {
    }

    /**
     * Submit an autosave request through an existing Symfony form type.
     *
     * The save callback is only invoked for a valid form. It may return extra
     * response data, such as an id or the update URL for a newly created item.
     *
     * @param class-string $formType
     * @param callable(mixed, FormInterface): (array<string, mixed>|null) $save
     * @param array<string, mixed> $formOptions
     */
    public function handle(
        Request $request,
        string $formType,
        mixed $data,
        callable $save,
        array $formOptions = [],
    ): JsonResponse {
        $form = $this->formFactory->createNamed('', $formType, $data, $formOptions);
        $form->submit($this->requestData($request));

        if (!$form->isSubmitted() || !$form->isValid()) {
            return new JsonResponse([
                'saved' => false,
                'errors' => $this->errors($form),
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $result = $save($form->getData(), $form);
        if ($result !== null && !is_array($result)) {
            throw new \UnexpectedValueException('The autosave callback must return an array or null.');
        }

        return new JsonResponse([
            'saved' => true,
            ...($result ?? []),
        ]);
    }

    /** @return array<string, mixed> */
    private function requestData(Request $request): array
    {
        return $this->mergeFiles($request->request->all(), $request->files->all());
    }

    /**
     * @param array<string, mixed> $data
     * @param array<string, UploadedFile|array<mixed>|null> $files
     * @return array<string, mixed>
     */
    private function mergeFiles(array $data, array $files): array
    {
        foreach ($files as $name => $file) {
            if (is_array($file)) {
                $existing = isset($data[$name]) && is_array($data[$name]) ? $data[$name] : [];
                $data[$name] = $this->mergeFiles($existing, $file);
            } elseif ($file !== null) {
                $data[$name] = $file;
            }
        }

        return $data;
    }

    /** @return array<string, list<string>|array<string, mixed>> */
    private function errors(FormInterface $form): array
    {
        $errors = [];
        $ownErrors = array_map(
            static fn (FormError $error): string => $error->getMessage(),
            iterator_to_array($form->getErrors(false)),
        );
        if ($ownErrors !== []) {
            $errors['_errors'] = $ownErrors;
        }

        foreach ($form as $child) {
            $childErrors = $this->errors($child);
            if ($childErrors !== []) {
                $errors[$child->getName()] = $childErrors;
            }
        }

        return $errors;
    }
}
