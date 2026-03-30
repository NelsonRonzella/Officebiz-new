<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductDocumentCategory;
use App\Models\ProductStep;
use App\Models\Tutorial;

use Illuminate\Http\Request;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{

    public function index(Request $request)
    {

        $query = Product::query();

        if ($request->filled('search')) {
            $query->where('name','like','%'.$request->search.'%');
        }

        if ($request->filled('type')) {
            $query->where('type',$request->type);
        }

        if ($request->filled('status')) {
            $query->where('active',$request->status);
        }

        $products = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return view('produtos', compact('products'));

    }


    public function createPontual()
    {

        $tutorials = Tutorial::all();

        return view('cadastrar-produto-pontual',compact('tutorials'));

    }


    public function createRecorrente()
    {

        $tutorials = Tutorial::all();

        return view('cadastrar-produto-recorrente',compact('tutorials'));

    }


    public function store(StoreProductRequest $request)
    {

        $data = $request->validated();

        $product = Product::create($data);

        if ($product->isRecorrente()) {

            $abas = json_decode($request->abas, true) ?? [];

            foreach ($abas as $aba) {
                ProductDocumentCategory::create([
                    'product_id'  => $product->id,
                    'title'       => $aba['titulo'] ?? '',
                    'description' => $aba['descricao'] ?? '',
                    'order'       => $aba['ordem'] ?? 0,
                ]);
            }

        } else {

            $steps = json_decode($request->etapas, true) ?? [];

            foreach ($steps as $step) {
                ProductStep::create([
                    'product_id'    => $product->id,
                    'title'         => $step['titulo'] ?? '',
                    'description'   => $step['descricao'] ?? '',
                    'order'         => $step['ordem'] ?? 0,
                    'duration_days' => $step['tempo'] ?? 0,
                ]);
            }

        }

        /*
        |-----------------------------------------
        | Tutoriais
        |-----------------------------------------
        */

        if ($request->filled('tutorials')) {

            $product->tutorials()->sync(
                $request->tutorials
            );

        }

        if ($request->ajax()) {
            return response()->json(['message' => 'Produto criado com sucesso!', 'redirect' => route('produtos')]);
        }

        return redirect()
            ->route('produtos')
            ->with('success','Produto criado com sucesso');

    }


    public function show($id)
    {

        $product = Product::with(['steps', 'documentCategories', 'tutorials'])
            ->findOrFail($id);

        return view('visualizar-produto',compact('product'));

    }


    public function toggle(Request $request, $id)
    {

        $product = Product::findOrFail($id);

        $product->update([
            'active' => !$product->active
        ]);

        if ($request->ajax()) {
            $status = $product->active ? 'ativado' : 'desativado';
            return response()->json(['message' => "Produto {$status} com sucesso!"]);
        }

        return back();

    }


    public function destroy(Request $request, $id)
    {

        $product = Product::findOrFail($id);

        $product->delete();

        if ($request->ajax()) {
            return response()->json(['message' => 'Produto excluído com sucesso!']);
        }

        return back();

    }

    public function edit($id)
    {

        $product = Product::with(['steps', 'documentCategories', 'tutorials'])
            ->findOrFail($id);

        $tutorials = Tutorial::all();

        if ($product->isRecorrente()) {

            $abas = $product->documentCategories->map(fn($c) => [
                'titulo'   => $c->title,
                'descricao' => $c->description,
                'ordem'    => $c->order,
            ]);

            return view('cadastrar-produto-recorrente', [
                'product'   => $product,
                'tutorials' => $tutorials,
                'abas'      => $abas,
            ]);

        }

        $steps = $product->steps->map(fn($step) => [
            'titulo'   => $step->title,
            'descricao' => $step->description,
            'tempo'    => $step->duration_days,
            'ordem'    => $step->order,
        ]);

        return view('cadastrar-produto-pontual', [
            'product'   => $product,
            'tutorials' => $tutorials,
            'steps'     => $steps,
        ]);

    }

    public function update(UpdateProductRequest $request,$id)
    {

        $product = Product::findOrFail($id);

        $product->update(
            $request->validated()
        );

        /*
        |---------------------------------
        | Atualizar etapas / abas
        |---------------------------------
        */

        if ($product->isRecorrente()) {

            $product->documentCategories()->delete();

            $abas = json_decode($request->abas, true) ?? [];

            foreach ($abas as $aba) {
                $product->documentCategories()->create([
                    'title'       => $aba['titulo'] ?? '',
                    'description' => $aba['descricao'] ?? '',
                    'order'       => $aba['ordem'] ?? 0,
                ]);
            }

        } else {

            $product->steps()->delete();

            $steps = json_decode($request->etapas, true) ?? [];

            foreach ($steps as $step) {
                $product->steps()->create([
                    'title'         => $step['titulo'] ?? '',
                    'description'   => $step['descricao'] ?? '',
                    'order'         => $step['ordem'] ?? 0,
                    'duration_days' => $step['tempo'] ?? 0,
                ]);
            }

        }

        /*
        |---------------------------------
        | Atualizar tutoriais
        |---------------------------------
        */

        if ($request->filled('tutorials')) {

            $product->tutorials()->sync(
                $request->tutorials
            );

        }

        if ($request->ajax()) {
            return response()->json(['message' => 'Produto atualizado com sucesso!', 'redirect' => route('produtos')]);
        }

        return redirect()
            ->route('produtos')
            ->with('success','Produto atualizado');

    }

}